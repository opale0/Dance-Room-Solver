import Promise from "../PromiseV2";

type ResponseModifiers = {
    json?: boolean;
    resolveWithFullResponse?: boolean;
}

type Json<ParseJson extends boolean> = ParseJson extends true ? any : string;

type FullResponse<ParseJson extends boolean> = {
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    body: Json<ParseJson>;
}

export type PossibleResponses<T extends ResponseModifiers> = T["resolveWithFullResponse"] extends true
    ? FullResponse<T["json"] extends boolean ? T["json"] : false>
    : Json<T["json"] extends boolean ? T["json"] : false>;

export type Options<T extends ResponseModifiers> = T & {
    url: string;
    method?: "GET" | "POST" | "HEAD" | "OPTIONS" | "PUT" | "DELETE" | "TRACE";
    timeout?: number;
    connectTimeout?: number;
    readTimeout?: number;
    headers?: Record<string, string>;
    qs?: Record<string, string>;
    body?: Record<any, any>;
    form?: Record<string, string>;
    multipart?: Record<any, any | { file: string; }>;
    followRedirect?: boolean;
}

export declare function request<T extends ResponseModifiers>(o: string | Options<T>): Promise<PossibleResponses<T>>;
export default request;
