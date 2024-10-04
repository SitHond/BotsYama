const moment = require('moment');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const User = newState.client.sequelize.models.User;
        const Settings = newState.client.sequelize.models.Settings;

        const userId = newState.id;
        const guildId = newState.guild.id;

        // Get AFK channel ID
        const settings = await Settings.findOne({ where: { guildId } });
        const afkChannelId = settings ? settings.afkChannelId : null;

        // If user joins a voice channel and it is not the AFK channel
        if (!oldState.channelId && newState.channelId && newState.channelId !== afkChannelId) {
            newState.client.voiceTimes = newState.client.voiceTimes || {};
            newState.client.voiceTimes[userId] = moment();
        }

        // If user leaves a voice channel and it is not the AFK channel
        if (oldState.channelId && !newState.channelId && oldState.channelId !== afkChannelId) {
            const enterTime = newState.client.voiceTimes && newState.client.voiceTimes[userId];
            if (enterTime) {
                const exitTime = moment();
                const duration = moment.duration(exitTime.diff(enterTime)).asMinutes(); // Time in minutes

                delete newState.client.voiceTimes[userId];

                // Update user activity in the database
                try {
                    const [user] = await User.findOrCreate({
                        where: { id: userId, guildId: guildId },
                        defaults: { activity: 0 },
                    });

                    // Add activity duration
                    user.activity += duration;
                    await user.save();

                    console.log(`User ${userId} was active for ${duration} minutes in voice channel.`);
                } catch (error) {
                    console.error('Error updating activity:', error);
                }
            }
        }
    },
};
