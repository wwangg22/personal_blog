import { SSTConfig } from "sst";
import { Config, NextjsSite, Bucket, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "personal-blog",
      region: "us-east-1",
    };
  },
  stacks(app) {


    app.stack(function Site({ stack }) {
      const bucket = new Bucket(stack, "publix");

      const table = new Table(stack, "onetab", {
        fields: {
          PK: "string",
          SK: "string"
        },
        primaryIndex: { partitionKey: "PK", sortKey: "SK" },
      });
      const JWT_TOKEN = new Config.Secret(stack, "JWT_SECRET_TOKEN");

      const site = new NextjsSite(stack, "site",{
        bind: [bucket, table, JWT_TOKEN],
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
