export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { player_name, affection, ending } = req.body || {};

    // 最低限のチェック
    if (
      typeof player_name !== "string" ||
      player_name.trim().length === 0 ||
      player_name.trim().length > 30 ||
      typeof affection !== "number" ||
      !Number.isFinite(affection) ||
      typeof ending !== "string" ||
      ending.trim().length === 0 ||
      ending.trim().length > 100
    ) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/game_results`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          player_name: player_name.trim(),
          affection: Math.round(affection),
          ending: ending.trim(),
        }),
      }
    );

    if (!response.ok) {
      console.error("Supabase error:", await response.text());
      return res.status(500).json({ error: "Failed to save result" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("save-result error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
