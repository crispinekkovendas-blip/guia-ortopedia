import { redirect } from "next/navigation";

/** A raiz é o índice do guia. */
export default function Home() {
  redirect("/guia");
}
