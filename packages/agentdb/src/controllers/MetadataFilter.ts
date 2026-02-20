/**
 * Advanced Metadata Filtering
 *
 * Implements MongoDB-style query operators for filtering
 * episodes and patterns based on metadata fields.
 *
 * Supported operators:
 * - $eq: Equal to
 * - $ne: Not equal to
 * - $gt: Greater than
 * - $gte: Greater than or equal to
 * - $lt: Less than
 * - $lte: Less than or equal to
 * - $in: Value is in array
 * - $nin: Value is not in array
 * - $contains: String/array contains value
 * - $exists: Field exists
 */

export type FilterOperator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin' | '$contains' | '$exists';

export type FilterValue = string | number | boolean | string[] | number[] | { [op in FilterOperator]?: string | number | boolean | string[] | number[] };

export interface MetadataFilters {
  [field: string]: FilterValue;
}

export interface FilterableItem {
  metadata?: Record<string, unknown> | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- index signature required for dynamic metadata field access
  [key: string]: any;
}

export class MetadataFilter {
  /**
   * Apply filters to a collection of items
   *
   * @param items - Items to filter
   * @param filters - MongoDB-style filter object
   * @returns Filtered items
   */
  static apply<T extends FilterableItem>(items: T[], filters: MetadataFilters): T[] {
    if (!filters || Object.keys(filters).length === 0) {
      return items;
    }

    return items.filter(item => this.matchesFilters(item, filters));
  }

  /**
   * Check if an item matches all filters
   */
  private static matchesFilters(item: FilterableItem, filters: MetadataFilters): boolean {
    for (const [field, filter] of Object.entries(filters)) {
      if (!this.matchesFilter(item, field, filter)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if an item matches a single filter
   */
  private static matchesFilter(item: FilterableItem, field: string, filter: FilterValue): boolean {
    // Get field value (supports nested paths like "metadata.year")
    const value = this.getFieldValue(item, field);

    // Handle simple equality
    if (typeof filter !== 'object' || Array.isArray(filter)) {
      return value === filter;
    }

    // Handle operator-based filters
    const operators = filter as { [op in FilterOperator]?: string | number | boolean | string[] | number[] };

    for (const [operator, operand] of Object.entries(operators)) {
      switch (operator as FilterOperator) {
        case '$eq':
          if (value !== operand) return false;
          break;

        case '$ne':
          if (value === operand) return false;
          break;

        case '$gt':
          if (!((value as number) > (operand as number))) return false;
          break;

        case '$gte':
          if (!((value as number) >= (operand as number))) return false;
          break;

        case '$lt':
          if (!((value as number) < (operand as number))) return false;
          break;

        case '$lte':
          if (!((value as number) <= (operand as number))) return false;
          break;

        case '$in':
          if (!Array.isArray(operand) || !(operand as Array<string | number>).includes(value as string | number)) return false;
          break;

        case '$nin':
          if (!Array.isArray(operand) || (operand as Array<string | number>).includes(value as string | number)) return false;
          break;

        case '$contains': {
          if (typeof value === 'string') {
            if (!value.includes(operand as string)) return false;
          } else if (Array.isArray(value)) {
            if (!value.includes(operand as string)) return false;
          } else {
            return false;
          }
          break;
        }

        case '$exists': {
          const exists = value !== undefined && value !== null;
          if (exists !== operand) return false;
          break;
        }

        default:
          console.warn(`Unknown operator: ${operator}`);
          return false;
      }
    }

    return true;
  }

  /**
   * Get field value from item (supports nested paths)
   */
  private static getFieldValue(item: FilterableItem, field: string): unknown {
    const parts = field.split('.');
    let value: unknown = item;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }

      const obj = value as Record<string, unknown>;

      // Parse metadata JSON if needed
      if (part === 'metadata' && typeof obj.metadata === 'string') {
        try {
          obj.metadata = JSON.parse(obj.metadata);
        } catch {
          return undefined;
        }
      }

      value = obj[part];
    }

    return value;
  }

  /**
   * Build SQL WHERE clause from filters (for database queries)
   *
   * @param filters - Metadata filters
   * @param tableName - Table name for column references
   * @returns SQL WHERE clause and parameters
   */
  static toSQL(filters: MetadataFilters, tableName: string = ''): { where: string; params: Array<string | number | boolean> } {
    const conditions: string[] = [];
    const params: Array<string | number | boolean> = [];
    const prefix = tableName ? `${tableName}.` : '';

    for (const [field, filter] of Object.entries(filters)) {
      // For metadata fields, use JSON extraction
      const isMetadata = field.startsWith('metadata.');
      const columnRef = isMetadata
        ? `json_extract(${prefix}metadata, '$.${field.slice(9)}')`
        : `${prefix}${field}`;

      if (typeof filter !== 'object' || Array.isArray(filter)) {
        // Simple equality
        conditions.push(`${columnRef} = ?`);
        params.push(filter as string | number | boolean);
      } else {
        // Operator-based filters
        const operators = filter as { [op in FilterOperator]?: string | number | boolean | string[] | number[] };

        for (const [operator, operand] of Object.entries(operators)) {
          switch (operator as FilterOperator) {
            case '$eq':
              conditions.push(`${columnRef} = ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$ne':
              conditions.push(`${columnRef} != ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$gt':
              conditions.push(`${columnRef} > ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$gte':
              conditions.push(`${columnRef} >= ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$lt':
              conditions.push(`${columnRef} < ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$lte':
              conditions.push(`${columnRef} <= ?`);
              params.push(operand as string | number | boolean);
              break;

            case '$in':
              if (Array.isArray(operand)) {
                const placeholders = operand.map(() => '?').join(', ');
                conditions.push(`${columnRef} IN (${placeholders})`);
                params.push(...(operand as Array<string | number | boolean>));
              }
              break;

            case '$nin':
              if (Array.isArray(operand)) {
                const placeholders = operand.map(() => '?').join(', ');
                conditions.push(`${columnRef} NOT IN (${placeholders})`);
                params.push(...(operand as Array<string | number | boolean>));
              }
              break;

            case '$contains':
              conditions.push(`${columnRef} LIKE ?`);
              params.push(`%${operand}%`);
              break;

            case '$exists':
              if (operand) {
                conditions.push(`${columnRef} IS NOT NULL`);
              } else {
                conditions.push(`${columnRef} IS NULL`);
              }
              break;
          }
        }
      }
    }

    const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    return { where, params };
  }

  /**
   * Validate filter object
   */
  static validate(filters: MetadataFilters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, filter] of Object.entries(filters)) {
      if (!field || field.trim() === '') {
        errors.push('Filter field name cannot be empty');
      }

      if (typeof filter === 'object' && !Array.isArray(filter)) {
        const operators = Object.keys(filter);
        for (const op of operators) {
          if (!op.startsWith('$')) {
            errors.push(`Invalid operator: ${op} (must start with $)`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
