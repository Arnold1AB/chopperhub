Deno.serve((req) => {
  const url = new URL(req.url);
  const reference =
    url.searchParams.get("reference") ?? url.searchParams.get("trxref") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const redirectUrl = new URL("chopperhub://payment-callback");

  if (reference) redirectUrl.searchParams.set("reference", reference);
  if (status) redirectUrl.searchParams.set("status", status);

  return Response.redirect(redirectUrl.toString(), 302);
});
