export interface AppGeneratorSchema {
  name: string;
  title?: string;
  tags?: string;
  directory?: string;
  pgUser?: string;
  pgDb?: string;
  pgPassword: string;
}
