import { Handler } from './Handler'
import { VoiceChannel, VoiceConnection, Message } from 'discord.js';
import { Logger } from "../conf/Logger";
import { Readable } from 'stream'

import googleTTS = require('google-tts-api');
import fetch = require("node-fetch");

export class VoiceHandler extends Handler {

    constructor(command: string) {
        super(command, true);
    }

    async handler(msg: Message) {
        if (!this.validate(msg)) return;

        const voiceChannel: VoiceChannel = msg.member.voice.channel;
        const message = msg.content.substring(7);
        this.convertAndSend(message, voiceChannel);
    }

    async convertAndSend(msg: String, voiceChannel: VoiceChannel) {
        const url = await googleTTS(msg, 'pt-br', 1);
        let response = await fetch(url);
        const readable = new Readable()
        readable._read = () => {}
        readable.push(await response.buffer())
        readable.push(null)

        voiceChannel.join().then(async (vc: VoiceConnection) => {
            const dispatcher = vc.play(readable, { volume: 1 });
            dispatcher.on("finish", () => voiceChannel.leave());
        }).catch(error => {
            Logger.error(error, "Error message");
            voiceChannel.leave();
        });
    }

    async sendVoice(msg: String, channel: VoiceChannel) {
        this.convertAndSend(msg, channel);
    }
}