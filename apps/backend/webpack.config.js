module.exports = (options, webpack) => {
  return {
    ...options,
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
