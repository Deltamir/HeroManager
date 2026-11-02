/**
 * Drift guard between Better Auth's expected schema and `prisma/schema.prisma`.
 *
 * Better Auth decides at runtime which tables / columns it reads and writes,
 * from its own core schema plus whatever the configured plugins add. A
 * dependency bump (Dependabot automerges minors) or a new plugin in
 * `lib/auth.ts` can change that set without touching `schema.prisma` — and
 * nothing fails until the first sign-in in production.
 *
 * This test asks Better Auth itself (`getAuthTables`, re-exported by
 * `better-auth/db`) for the tables it expects, using the REAL options
 * object built by `lib/auth.ts` (real plugins included), and compares them
 * with the Prisma schema:
 *
 *   1. every expected table exists as a Prisma model (matched via @@map);
 *   2. every expected column exists, with a compatible scalar type;
 *   3. a column Better Auth always writes (`required: true`) is not
 *      silently optional on the Prisma side;
 *   4. a Prisma column on an auth table that Better Auth does NOT know
 *      about is either optional or has a default — otherwise every insert
 *      issued by the adapter fails with a NOT NULL violation.
 *
 * Column names / types / the table mapping come from the generated Prisma
 * client (`Prisma.dmmf`). Its runtime DMMF does not carry optionality nor
 * defaults, so those two flags are read from `schema.prisma` itself.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { Prisma } from "@prisma/client";
import { getAuthTables } from "better-auth/db";
import type { BetterAuthOptions } from "better-auth";

// Capture the options object instead of building a real auth instance.
// Plugins (`better-auth/plugins`) are deliberately NOT mocked: plugin
// schemas are exactly what this test must pick up.
let capturedOptions: BetterAuthOptions | undefined;
vi.mock("better-auth", () => ({
  betterAuth: (options: BetterAuthOptions) => {
    capturedOptions = options;
    return { handler: vi.fn(), api: {} };
  },
}));
vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter: () => ({}),
}));
vi.mock("~~/server/utils/email", () => ({
  sendMagicLinkEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}));
vi.mock("~~/lib/prisma", () => ({ default: {} }));

// Better Auth field type → accepted Prisma scalar types.
const COMPATIBLE_TYPES: Record<string, string[]> = {
  string: ["String"],
  boolean: ["Boolean"],
  date: ["DateTime"],
  number: ["Int", "BigInt", "Float", "Decimal"],
  json: ["Json"],
  "string[]": ["String"],
  "number[]": ["Int", "BigInt", "Float", "Decimal"],
};

type SchemaField = { optional: boolean; hasDefault: boolean };

/**
 * Minimal reader for the field lines of `schema.prisma` (`name Type? @attr`).
 * Only optionality and default-ness are extracted; everything else comes
 * from the DMMF.
 */
function readSchemaFields(): Map<string, Map<string, SchemaField>> {
  const source = readFileSync(
    resolve(process.cwd(), "prisma/schema.prisma"),
    "utf8",
  );
  const models = new Map<string, Map<string, SchemaField>>();
  let current: Map<string, SchemaField> | undefined;
  for (const rawLine of source.split("\n")) {
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    const modelStart = /^model\s+(\w+)\s*\{/.exec(line);
    if (modelStart) {
      current = new Map();
      models.set(modelStart[1]!, current);
      continue;
    }
    if (line === "}") {
      current = undefined;
      continue;
    }
    const field = /^(\w+)\s+\w+(\?|\[\])?(.*)$/.exec(line);
    if (current && field) {
      current.set(field[1]!, {
        optional: field[2] === "?",
        hasDefault: /@default\(|@updatedAt/.test(field[3]!),
      });
    }
  }
  return models;
}

describe("Better Auth schema ↔ prisma/schema.prisma", () => {
  let tables: ReturnType<typeof getAuthTables>;
  const schemaFields = readSchemaFields();
  const prismaModels = Prisma.dmmf.datamodel.models;

  beforeAll(async () => {
    await import("~~/lib/auth");
    expect(capturedOptions, "lib/auth.ts did not call betterAuth()").toBeDefined();
    tables = getAuthTables(capturedOptions!);
  });

  it("has a Prisma model for every table Better Auth expects", () => {
    const missing = Object.values(tables)
      .map((table) => table.modelName)
      .filter(
        (name) =>
          !prismaModels.some((model) => (model.dbName ?? model.name) === name),
      );
    expect(missing, "tables missing from schema.prisma").toEqual([]);
  });

  it("matches every expected column, its type and its required flag", () => {
    const problems: string[] = [];
    for (const table of Object.values(tables)) {
      const model = prismaModels.find(
        (m) => (m.dbName ?? m.name) === table.modelName,
      );
      if (!model) continue; // reported by the previous test
      const flags = schemaFields.get(model.name);

      for (const [key, attr] of Object.entries(table.fields)) {
        const column = attr.fieldName ?? key;
        const field = model.fields.find((f) => f.name === column);
        if (!field) {
          problems.push(`${model.name}.${column}: missing`);
          continue;
        }
        const accepted = COMPATIBLE_TYPES[String(attr.type)];
        if (accepted && !accepted.includes(field.type)) {
          problems.push(
            `${model.name}.${column}: Prisma type ${field.type}, Better Auth expects ${String(attr.type)}`,
          );
        }
        if (attr.required !== false && flags?.get(column)?.optional) {
          problems.push(
            `${model.name}.${column}: optional in Prisma but required by Better Auth`,
          );
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("gives a default to any extra required column on an auth table", () => {
    const problems: string[] = [];
    for (const table of Object.values(tables)) {
      const model = prismaModels.find(
        (m) => (m.dbName ?? m.name) === table.modelName,
      );
      if (!model) continue;
      const known = new Set([
        "id",
        ...Object.entries(table.fields).map(([key, f]) => f.fieldName ?? key),
      ]);
      for (const field of model.fields) {
        if (field.kind !== "scalar" || known.has(field.name)) continue;
        const flags = schemaFields.get(model.name)?.get(field.name);
        if (flags && !flags.optional && !flags.hasDefault) {
          problems.push(
            `${model.name}.${field.name}: required, no default, unknown to Better Auth`,
          );
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
