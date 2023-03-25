import { UIEmbed } from "@dynamico/ui/base/ui-embed";

export class EmbedTest extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/EmbedTest";
    }

    protected getTitle() {
        return "Welcome to Dynamico Community Server!";
    }

    protected getDescription() {
        return "We're glad to have you here ✌️\n" +
            "This is the official community for Dynamico, where you can get help, share your feedback, and connect with other users.\n\n" +
            "**Before you get started, please consider our rules:**\n" +
            "- Be respectful - Treat others with kindness and respect.\n" +
            "- Keep content appropriate - Ensure all text, images, and links are suitable for all members.\n" +
            "- Follow Discord's Terms of Service - Stay within the platform's rules and regulations.\n\n" +
            "**What is Dynamico and how it works?**\n" +
            "Activating Dynamico on your server is a breeze!\n" +
            "Check out our concise guide on <#1080497834740154480>\n" +
            "Discover Dynamico's potential by testing out its features in <#1085966740518883459>\n\n" +
            "**Need help?**\n" +
            "Try reaching out to our helpful community members first in <#1080474758224809995>\n" +
            "If you still need assistance, please submit a <#1080474716550221846>, and our team will get back to you as soon as possible.\n\n" +
            "**Have a great idea to enhance Dynamico's performance?**\n" +
            "Share it with us in <#1080474858946834442> and let's make it happen together!\n\n" +
            "**Don't miss out on important news and updates!**\n" +
            "Keep an eye on our <#1080472259090718731> channel and <#1080528028398010540> channel for the latest information.";
    }

    protected getColor(): number {
        return 0x2196F3;
    }

    protected getFields() {
        return [];
    }

    protected async getFieldsLogic( interaction?: null ) {
        return {};
    }
}

export default EmbedTest;
