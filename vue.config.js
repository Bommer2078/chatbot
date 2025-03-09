const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/chatbot/'  // 替换为您的仓库名称
    : '/',
  outputDir: 'dist'
})
