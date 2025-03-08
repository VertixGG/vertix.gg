import process from "process";


export let gToken = "";



export default async function (client: any, onLogin: Function) {
    if (process.env.DISCORD_TEST_TOKEN) {
        gToken = process.env.DISCORD_TEST_TOKEN;
        await client.login(gToken).then(onLogin);
        return;
    }

    console.log("No token found");
    process.exit(0);
}
