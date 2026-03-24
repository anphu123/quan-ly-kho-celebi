module.exports = (options, webpack) => {
  return {
    ...options,
    entry: {
      main: './src/main.ts',
      serverless: './src/serverless.ts',
    },
    output: {
      ...options.output,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            '@nestjs/websockets/socket-module',
            'cache-manager',
            'class-validator',
            'class-transformer',
          ];
          if (!lazyImports.includes(resource)) return false;
          try {
            require.resolve(resource);
            return false;
          } catch {
            return true;
          }
        },
      }),
    ],
  };
};
