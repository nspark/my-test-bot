// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {

    // app.on('issues.opened', async context => {
    //     app.log(context)
    //     const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    //     return context.github.issues.createComment(issueComment)
    // })

    app.on('check_run.completed', async context => {
        const workflow_runs =
              (await context.github.actions.listRepoWorkflowRuns({
                  owner:  context.payload.repository.owner.login,
                  repo:   context.payload.repository.name,
                  author: context.payload.sender.login,
              })).data.workflow_runs

        // TODO: There may be a race condition in retrieving the
        // artifacts; sometimes the result is an empty list, but will
        // succeed when run after a short break.
        const artifacts =
              (await context.github.actions.listWorkflowRunArtifacts({
                  owner: context.payload.repository.owner.login,
                  repo: context.payload.repository.name,
                  run_id: workflow_runs[0].id
              })).data.artifacts

        for (const pull of context.payload.check_run.check_suite.pull_requests) {
            return context.github.issues.createComment({
                owner:  context.payload.repository.owner.login,
                repo:   context.payload.repository.name,
                issue_number: pull.number,
                body: `Build artifact [${artifacts[0].name}.zip](https://github.com/nspark/test/suites/${context.payload.check_run.check_suite.id}/artifacts/${artifacts[0].id})`
            })
        }
    })
}
