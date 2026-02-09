module.exports = [
"[project]/packages/api/src/index.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/packages_api_src_index_ts_e7fada60._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/packages/api/src/index.ts [app-ssr] (ecmascript)");
    });
});
}),
];