import * as cdk from 'aws-cdk-lib';
import { App, GitHubSourceCodeProvider, Platform, RedirectStatus } from '@aws-cdk/aws-amplify-alpha';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class NextDeployAwsAmplifyCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const amplifyApp = new App(this, "amplify-next-app", {
      appName: "Nextjs Hosting Example",
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: "OmarMWarraich",
        repository: "next-example-hosting",
        oauthToken: cdk.SecretValue.secretsManager("github-token-ex"),
    }),
    autoBranchDeletion: true,
    platform: Platform.WEB_COMPUTE,
    customRules: [
      {
        source: "/<*>",
        target: "/index.html",
        status: RedirectStatus.NOT_FOUND_REWRITE,
      }
    ],
    buildSpec: codebuild.BuildSpec.fromObjectToYaml({
      version: "1.0",
      frontend: {
        phases: {
          preBuild: {
            commands: [
              "npm ci",
            ],
          },
          build: {
            commands: [
              "npm run build",
            ],
          },
        },
        artifacts: {
          baseDirectory: ".next",
          files: [
            "**/*",
          ],
        },
        cache: {
          paths: [
            "node_modules/**/*",
            ".next/cache/**/*",
          ],
        },
      },
      
    }),
  });
  amplifyApp.addBranch("main", { stage: "PRODUCTION" });
}
}
