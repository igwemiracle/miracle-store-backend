const CardConfigSettings = require("../models/CardConfigSettings");
const CardConfig = require("../models/CardConfig");
const { default: axios } = require("axios");

const categoryConfigMap = {
  fashion: {
    title: "Latest in Fashion",
    linkText: "Shop Fashion",
  },
  luggage: {
    title: "Best Luggage for Travel",
    linkText: "Explore Luggage",
  },
  computers: {
    title: "Hot Picks in Computers",
    linkText: "View All Computers",
  },
  electronics: {
    title: "Trending Electronics Deals",
    linkText: "Browse Electronics",
  },
  "video-games": {
    title: "Top Video Games Today",
    linkText: "See All Games",
  },
};
const runAutoCardConfigUpdate = async () => {
  try {
    const configSetting = await CardConfigSettings.findOne();
    if (!configSetting?.useAuto) {
      console.log("🛑 Auto-refresh skipped (useAuto = false)");
      return;
    }
    const latestRes = await axios.get("http://localhost:5000/api/v1/products/latest");
    const latest = latestRes.data.products.slice(0, 4);

    if (latest.length === 0) {
      console.warn("🚫 Skipping update: no latest products available");
      return;
    }

    const newLayout = [
      {
        type: "singleImage",
        title: "New Arrival",
        linkText: "Shop latest",
        productId: latest[0]._id,
      }
    ];

    const parentCategorySlugs = ["fashion", "luggage", "computers", "electronics", "video-games"];

    for (const slug of parentCategorySlugs) {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/categories/slug/${slug}`);
        const parent = res.data;

        if (!parent.subcategories?.length) {
          console.warn(`⚠️ No subcategories found for "${slug}"`);
          continue;
        }
        const subcategories = parent.subcategories.slice(0, 4);

        // Fallback to generic title/link if not found in map
        const config = categoryConfigMap[slug] || {
          title: `Top Picks in ${parent.name}`,
          linkText: `Explore ${parent.name}`,
        };

        newLayout.push({
          type: "grid",
          title: config.title,
          linkText: config.linkText,
          categoryIds: subcategories.map((sub) => sub._id),
        });

      } catch (err) {
        console.warn(`❌ Failed to process category "${slug}":`, err.message);
      }
    }

    await CardConfig.deleteMany({ source: "auto" });
    await CardConfig.insertMany(
      newLayout.map((card) => ({
        ...card,
        source: "auto",
      }))
    );

    await CardConfigSettings.findOneAndUpdate(
      {},
      {
        lastUpdatedAt: new Date(),
        lastUpdatedBy: "auto",
      },
      { upsert: true }
    );

    console.log("✅ Auto-refreshed cardsConfig with", newLayout.length, "cards");
  } catch (err) {
    console.error("❌ Failed to refresh cardsConfig:", err.message);
  }
};

module.exports = {
  runAutoCardConfigUpdate
};