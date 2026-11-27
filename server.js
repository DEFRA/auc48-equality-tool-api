import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import databricks from '@databricks/sql'

const { DBSQLClient } = databricks

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/test', async (req, res) => {
  const client = new DBSQLClient()
  try {
    await client.connect({
      host: process.env.DATABRICKS_HOST,
      path: process.env.DATABRICKS_HTTP_PATH,
      token: process.env.DATABRICKS_TOKEN
    })
    const session = await client.openSession()
    const op = await session.executeStatement('SELECT 1 AS ok, current_user() AS who')
    const rows = await op.fetchAll()
    await op.close()
    await session.close()
    res.json({ rows })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  } finally {
    await client.close()
  }
})

app.listen(process.env.PORT, () => console.log(`API on ${process.env.PORT}`))