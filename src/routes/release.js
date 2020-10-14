require('dotenv').config()
const {
  GITHUB_USERNAME = '',
  GITHUB_PERSONAL_TOKEN = '',
  GITHUB_REPO = '',
  GITHUB_BRANCH = '',
} = process.env

const emptyGitHubCommit = require('make-empty-github-commit')

module.exports = (api) => {
  api.post('/release', async (req, res) => {

    console.log(req.body)
    return { committed: false }

    const { sha } = await emptyGitHubCommit({
      owner: 'username',
      repo: 'repo name',
      token: GITHUB_PERSONAL_TOKEN,
      message: 'my message',
      branch: 'develop' // "master" is default
    })
    req.log.info('Published git commit', { sha })

    return { committed: true }
  })
}
