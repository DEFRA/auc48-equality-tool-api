import { health } from '#/routes/health.js'
import { example } from '#/routes/example.js'
import { databricksTest } from '#/routes/databricks-test.js'

export const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health, databricksTest].concat(example))
    }
  }
}
