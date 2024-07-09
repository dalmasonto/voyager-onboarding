import * as z from "zod";

export const pageSizeOptions = z.union([
    z.literal(5),
    z.literal(10),
    z.literal(25),
    z.literal(50),
    z.literal(100)
]);

export const pageSizeArray = pageSizeOptions.options.map(option => option._def.value);;

export type IPageSize = z.infer<typeof pageSizeOptions>;

export const transformObjectToSqlInsert = (obj: any) => {
    return {
        columns: Object.keys(obj).join(", "),
        values: Object.values(obj).map(v => `'${v}'`).join(", ")
    }
}