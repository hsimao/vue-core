const { build } = require('esbuild')
const { resolve } = require('path')

// 取得指令參數 node scripts/dev.js reactivity -f global => { _: [ 'reactivity' ], f: 'global' }
const args = require('minimist')(process.argv.slice(2))

// 要打包的 packages 資料夾名稱
const target = args._[0] || 'reactivity'

// 開發環境只打包一個
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

// 打包的全域名稱
const globalName = pkg.buildOptions?.name || ''

const FORMAT_MAP = {
  global: 'iife', // 立即函式 => (function(){})()
  cjs: 'cjs', // node 中的模塊 => module.exports
  'esm-bundler': 'esm-bundler' // 瀏覽器中的 ES Module => import
}

// 打包格式
const format = args.f || 'global'
const outputFormat = FORMAT_MAP[format] || FORMAT_MAP.global

// 環境
const platform = format === 'cjs' ? 'node' : 'browser'

// 打包完的檔案名稱
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
)

// 打包入口檔
const entryPoints = resolve(__dirname, `../packages/${target}/src/index.ts`)

// 監控文件變化
const watch = {
  onRebuild(error) {
    if (!error) console.log('rebuilt')
  }
}

// esbuild 預設就支持 ts
build({
  entryPoints: [entryPoints],
  outfile,
  bundle: true, // 把所有的包全部打包一起
  sourcemap: true,
  format: outputFormat,
  globalName,
  platform,
  watch
}).then(() => console.log('Watching'))
