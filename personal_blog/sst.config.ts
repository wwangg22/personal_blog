import { SSTConfig } from "sst";
import { NextjsSite, Bucket } from "sst/constructs";

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
      const site = new NextjsSite(stack, "site",{
        bind: [bucket],
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
