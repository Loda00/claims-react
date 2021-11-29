const {
  override,
  // addBabelPreset,
  // addBabelPlugins,
  fixBabelImports,
  addLessLoader,

} = require("customize-cra");


module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd", libraryDirectory: "es", style: true // change importing css to less
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@primary-color": "#E6281E",
      "@input-hover-border-color": "@normal-color",
      "@layout-sider-background": "#E6281E",
      "@layout-header-background": "#f5f5f5",
      "@menu-dark-bg": "#E6281E",
      "@menu-dark-submenu-bg": "#E6281E",
      "@menu-item-color": "#fff",
      "@font-size-base": "12px",
      "@layout-body-background": "#f5f5f5",
      "@table-header-bg": "#fff",
      "@input-placeholder-color": "hsv(0, 0, 80%)"
    }
  }),
  // addBabelPreset("@babel/preset-react"),
  // ...addBabelPlugins(
  //   ["@babel/plugin-proposal-class-properties", { legacy: true }],
  //   "istanbul"
  // ),
);
