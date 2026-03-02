interface PMOptions {
  pmTool: string | null | undefined;
  pmApiKey: string | null | undefined;
  pmApiKey2: string | null | undefined;
  pmListId: string | null | undefined;
  clientName: string;
  company: string | null | undefined;
  email: string;
  onboardingId: string;
}

export async function createProjectTask(opts: PMOptions): Promise<void> {
  const { pmTool, pmApiKey, pmApiKey2, pmListId, clientName, company, email, onboardingId } = opts;

  if (!pmTool || !pmApiKey || !pmListId) return;

  const taskName = `Onboarding: ${clientName}${company ? ` (${company})` : ""}`;
  const taskDesc = `Cliente: ${email}\nOnboarding ID: ${onboardingId}\nConcluído via Vértice`;

  if (pmTool === "clickup") {
    await fetch(`https://api.clickup.com/api/v2/list/${pmListId}/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pmApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: taskName, description: taskDesc }),
    });
    return;
  }

  if (pmTool === "notion") {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pmApiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: pmListId },
        properties: {
          Name: { title: [{ type: "text", text: { content: taskName } }] },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: taskDesc } }],
            },
          },
        ],
      }),
    });
    return;
  }

  if (pmTool === "trello") {
    const token = pmApiKey2 ?? "";
    const url = new URL("https://api.trello.com/1/cards");
    url.searchParams.set("key", pmApiKey);
    url.searchParams.set("token", token);
    url.searchParams.set("idList", pmListId);
    url.searchParams.set("name", taskName);
    url.searchParams.set("desc", taskDesc);
    await fetch(url.toString(), { method: "POST" });
    return;
  }
}
