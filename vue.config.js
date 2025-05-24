const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // pathRewrite: { '^/api': '' }  // لو API في Laravel ما بيستخدمش /api كبداية URL
      }
    }
  }
})