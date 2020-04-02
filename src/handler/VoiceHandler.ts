import text2wav = require('text2wav')
import { Handler } from './Handler'
import { VoiceChannel, VoiceConnection, Message } from 'discord.js';
import { Logger } from "../conf/Logger";
import { Readable } from 'stream'


export class VoiceHandler implements Handler {

    async handler(msg: Message) {
        if (msg.content === '!pingVoice') { 
            let out = await text2wav("Olá Mundo", {
                voice: "pt"
            });

            const voiceChannel: VoiceChannel = msg.member.voice.channel;

            if (!voiceChannel) {
                Logger.log("User is not on a voice channel")
                return;
            }

            const readable = new Readable()
            readable._read = () => {}
            readable.push(out)
            readable.push(null)

            voiceChannel.join().then(async (vc: VoiceConnection) => {
                const dispatcher = vc.play(readable, { volume: 1 });
                dispatcher.on("finish", () => voiceChannel.leave());
            }).catch(error => {
                Logger.error(error);
                voiceChannel.leave();
            });
        }
    }
}