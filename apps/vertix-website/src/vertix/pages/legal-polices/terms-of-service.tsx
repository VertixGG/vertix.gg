import ReactMarkdown from "react-markdown";

const markdown = `
# Terms of Service
By using VoiceChannels, you agree to these terms of service. If you do not agree to these terms, please do not use the bot.
1. Use of VoiceChannels
VoiceChannels is a Discord bot that provides certain services to its users.
By using the bot, you agree to use it only for lawful purposes and in compliance with Discord's Terms of Service and Community Guidelines.

2. Paid Plans
VoiceChannels is free to use. Some limits, such as how many generators a server may run at once, can be raised by subscribing to a paid plan.
A plan is billed monthly in advance and renews automatically until it is cancelled.
Our order process is conducted by our online reseller Paddle.com, which is the Merchant of Record for all our orders. Paddle handles billing, customer service enquiries and returns; your receipt and your card or bank statement will show Paddle rather than VoiceChannels.
Prices are shown on the pricing page and may change. A change never affects a period that has already been paid for, and you will be told before the next payment is taken.
Cancelling, refunds, and what happens to your server when a plan ends are set out in our [Refund Policy](/refund-policy).
If a payment fails, the plan may be suspended. Nothing is deleted: the server returns to the free allowance, and any generators beyond it stop creating new rooms until payment succeeds.

3. Limitation of Liability
VoiceChannels is provided "as is" and without warranty of any kind, express or implied.
The creators of the bot are not liable for any damages arising from the use of the bot, including but not limited to direct, indirect, incidental, special, or consequential damages.

4. User Content
By using VoiceChannels, you agree that any content you provide to the bot, including but not limited to messages, commands, and user settings, may be stored and processed by the bot's creators.

5. Termination
The creators of VoiceChannels reserve the right to terminate the bot's service at any time, without notice, and for any reason.
The creators may also terminate your access to the bot's services if you violate these terms of service or if they determine that your use of the bot is harmful to the bot or its users.

6. User Conduct
By using VoiceChannels, you agree to conduct yourself in a respectful and lawful manner, and to not use the bot for any illegal or harmful purposes.
You also agree to comply with Discord's Terms of Service and Community Guidelines.

7. Privacy
VoiceChannels's creators respect your privacy and will not share your personal information with third parties without your consent.
Please refer to our Privacy Policy for more information.

8. Intellectual Property
VoiceChannels and its contents are the property of its creators and are protected by copyright and other intellectual property laws.
You may not copy, distribute, or modify any part of the bot without our prior written consent.

9. Modifications
The creators of VoiceChannels may modify these terms of service at any time, without notice.
By continuing to use the bot after modifications are made to these terms, you agree to be bound by the revised terms.

10. Third-party Services
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
