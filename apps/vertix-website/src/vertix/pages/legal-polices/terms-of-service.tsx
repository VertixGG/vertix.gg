import ReactMarkdown from "react-markdown";

const markdown = `
# Terms of Service
By using VoiceChannels, you agree to these terms of service. If you do not agree to these terms, please do not use the bot.
1. Use of VoiceChannels
VoiceChannels is a Discord bot that provides certain services to its users.
By using the bot, you agree to use it only for lawful purposes and in compliance with Discord's Terms of Service and Community Guidelines.

2. Limitation of Liability
VoiceChannels is provided "as is" and without warranty of any kind, express or implied.
The creators of the bot are not liable for any damages arising from the use of the bot, including but not limited to direct, indirect, incidental, special, or consequential damages.

3. User Content
By using VoiceChannels, you agree that any content you provide to the bot, including but not limited to messages, commands, and user settings, may be stored and processed by the bot's creators.

4. Termination
The creators of VoiceChannels reserve the right to terminate the bot's service at any time, without notice, and for any reason.
The creators may also terminate your access to the bot's services if you violate these terms of service or if they determine that your use of the bot is harmful to the bot or its users.

5. User Conduct
By using VoiceChannels, you agree to conduct yourself in a respectful and lawful manner, and to not use the bot for any illegal or harmful purposes.
You also agree to comply with Discord's Terms of Service and Community Guidelines.

6. Privacy
VoiceChannels's creators respect your privacy and will not share your personal information with third parties without your consent.
Please refer to our Privacy Policy for more information.

7. Intellectual Property
VoiceChannels and its contents are the property of its creators and are protected by copyright and other intellectual property laws.
You may not copy, distribute, or modify any part of the bot without our prior written consent.

8. Modifications
The creators of VoiceChannels may modify these terms of service at any time, without notice.
By continuing to use the bot after modifications are made to these terms, you agree to be bound by the revised terms.

9. Third-party Services
VoiceChannels may integrate with third-party services or websites, and the use of such services may be subject to additional terms and conditions.
The creators of VoiceChannels are not responsible for any content or services provided by third-party websites or services.

If you have any questions or concerns about this privacy policy or your personal information, please contact the bot's creators at [VoiceChannels Support](https://discord.gg/dEwKeQefUU).
`;

export default function TermsOfService() {
    return (
        <div className="vc-container vc-page-panel">
            <ReactMarkdown children={ markdown }/>
        </div>
    );
}
