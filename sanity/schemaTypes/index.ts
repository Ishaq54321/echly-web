import type { SchemaTypeDefinition } from "sanity";

import { authorType } from "./authorType";
import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";

/**
 * Every schema the Studio knows about. Add new document/object types here.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  postType,
  authorType,
  categoryType,
  blockContentType,
];
