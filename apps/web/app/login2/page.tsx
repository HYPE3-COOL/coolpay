import { AuthPage } from "../../components/auth-page";
import { authProviderServer } from "../../providers/auth-provider/auth-provider.server";
import { redirect } from "next/navigation";

export default async function Login() {
  const data = await getData();

  if (data.authenticated) {
    redirect(data?.redirectTo || "/");
  }

  return <AuthPage type="login" title={<img src="/assets/images/logo.png" style={{ padding: "0 12px", maxWidth: "100px" }} alt="Hype3 Logo" />} />;
}

async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
}
