import { Session } from "next-auth";


declare module "next-auth" {
  interface User {
    linkedAccounts: obj<string>
  }
}
