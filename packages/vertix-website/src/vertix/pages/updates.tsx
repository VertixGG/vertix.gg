import ReactMarkdown from "react-markdown";

import 'react-photo-view/dist/react-photo-view.css';

const markdown = `#### Latest Updates
- **19/07/2023**: \`0.0.7\` comes with new Greek language support, more details [here](/changelog).

- **11/07/2023**: \`0.0.6\` is now available! with new **Dynamic Channel AutoSave** Feature, Read the [Changelog](/changelog) for further details.

- **24/06/2023**: \`0.0.5\` has been released! We are excited to introduce **Dynamic Channel Logs**, Check out the full [Changelog](/changelog) for more details.

    [How to enable dynamic channel logs?](/posts/how-to-setup-logs-channel)
    
- **21/06/2023**: Since 20/06/2023 we updated **Vertix** to **Version \`0.0.4\`**, we added **Transfer Ownership** button for dynamic channels, and **block/unblock** menus. Check out the [Changelog](/changelog). If you are already an existing **Bot User**, the **Transfer Ownership** button will be disabled by default.
 
    [How to enable it?](/posts/enable-transfer-ownership)
    
- **19/06/2023**: The negative reviews on [top.gg](https://top.gg/bot/1111283172378955867) are made by our jealous competitor.

- **16/06/2023**: Version \`0.0.3\` has been released! We are excited to introduce a new interface for **Verified Roles**. Check out the [Changelog](/changelog) for more details and explore the accompanying images [here](/features-images).

- **12/06/2023 17:00 UTC**: 🎉 We are thrilled to announce that Vertix has achieved official **verification** by Discord! We extend our heartfelt gratitude to [Discord](https://discord.com/) for their exceptional service. See the [Changelog](/changelog) for more information.

- **12/06/2023**: Version \`0.0.2\` is now available! This release includes a minor fix for the 👥 **(\`Access\`)** button and introduces a new \`/help\` command. Read the [Changelog](/changelog) for further details.

- **09/06/2023**: We have released version \`0.0.1\` of Vertix, which introduces support for the Russian 🇷🇺 language. Visit the [Changelog](/changelog) for additional information.

- **06/06/2023**: We are actively working on an upcoming update for Vertix to support multiple languages. Our first language addition will be Russian, as our main developer is fluent in Russian. Once the update is complete, we plan to translate Vertix into other commonly used languages.

   We invite you to be a part of this journey and assist us in translating Vertix into your language. Join our [Discord Server](https://discord.com/invite/dEwKeQefUU) if you are interested. Your contributions will be greatly appreciated, and your name will be credited in the \`/credits\` command and on our official website. Stay tuned for more exciting updates!
`;

export default function Updates() {
    return (
        <>
            <div className="container box-1 updates">
                <ReactMarkdown children={ markdown }/>
            </div>
        </>
    )
}
