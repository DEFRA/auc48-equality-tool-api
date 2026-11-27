import databricks from '@databricks/sql'
import Boom from '@hapi/boom'

import { config } from '#/config.js'

const { DBSQLClient } = databricks

function getProxyOptions() {
  const proxyUrl = config.get('httpProxy')
  if (!proxyUrl) {
    return undefined
  }
  const url = new URL(proxyUrl)
  return {
    protocol: url.protocol.replace(':', ''),
    host: url.hostname,
    port: Number(url.port) || (url.protocol === 'https:' ? 443 : 80)
  }
}

export const databricksTest = {
  method: 'GET',
  path: '/databricks-test',
  handler: async (request) => {
    const client = new DBSQLClient()
    try {
      await client.connect({
        host: config.get('databricks.host'),
        path: config.get('databricks.httpPath'),
        token: config.get('databricks.token'),
        proxy: getProxyOptions()
      })
      const session = await client.openSession()
      const op = await session.executeStatement(
        'SELECT 1 AS ok, current_user() AS who'
      )
      const rows = await op.fetchAll()
      await op.close()
      await session.close()
      return { rows }
    } catch (error) {
      request.logger.error(error, 'Databricks test failed')
      throw Boom.badGateway('Databricks query failed')
    } finally {
      await client.close()
    }
  }
}
