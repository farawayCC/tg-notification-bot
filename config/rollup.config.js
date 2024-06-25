import typescript from 'rollup-plugin-typescript2'


export default {
    input: 'src/index.ts',
    output: {
        file: 'bundle.js',
        format: 'es',
    },
    plugins: [
        typescript({ tsconfig: 'config/tsconfig.json' }),
    ],
}
