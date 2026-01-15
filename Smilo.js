// Inspired by Apple Watch Activity Rings

const WIDGET_CONFIG = {
  colors: {
    green: { light: "#00D787", dark: "#00A65F" },
    blue: { light: "#007AFF", dark: "#0A84FF" },
    orange: { light: "#FF9500", dark: "#FF9F0A" },
    yellow: { light: "#FFD60A", dark: "#FFD700" },
  },
  emojis: ["🙂", "☺️", "😊", "😁", "🥳"],
  motivationalMessages: {
    noSmiles: [
      "Time to smile! ☀️",
      "First smile? 😊",
      "Share a smile! ✨",
      "Smile moment! 🌟",
      "Spread smiles! 💫",
      "Smile break! 🌈",
    ],
    progress: [
      "More smiles! 🎉",
      "Keep smiling! 👏",
      "Smile streak! 💪",
      "Smiles shared! ✨",
      "Almost smiling! 🚀",
      "Smile power! 🔥",
    ],
    goalReached: [
      "Smile goal! 🌟",
      "Smile master! 🎯",
      "Smile star! ⭐",
      "Smile joy! 💫",
      "Smile bright! 🌞",
      "Smile champ! 🏆",
    ],
  },
  defaultSettings: {
    dailyGoal: 2,
    color: "green",
    notificationsEnabled: true,
    notificationTimes: ["09:00", "15:00"],
  },
};

const NOTIFICATION_MESSAGES = [
  "Your teeth deserve to be seen! 😁",
  "Little smile makes you happy and people around too! 🌟",
  "Psst... your smile is your secret weapon! 😉",
  "Warning: Smiling may cause contagious happiness! ⚠️😄",
  "Your face called - it's missing a smile! 📞😊",
  "Smile delivery service: One grin please! 🚚😁",
  "Breaking news: You look 10x better when smiling! 📰",
  "Free happiness upgrade: Just add smile! 🎆",
  "Your smile is trending today! Don't disappoint your fans 😎",
  "Reminder: Smiles have zero calories but infinite benefits! 🍰",
  "Emergency smile needed - deploy immediately! 🚑😄",
  "Your smile just made someone's day (even if it's just yours)! ✨",
  "Smile status: Currently offline. Please reconnect! 🔌😊",
  "Fun fact: Smiling uses fewer muscles than frowning! Lazy? Perfect! 😴😁",
  "Your smile is like WiFi - everyone wants to connect! 📶😄",
  "Smile quota for today: Still accepting applications! 📝",
  "Plot twist: You're the reason someone smiled today! 🎭😊",
  "Smile insurance claim: Happiness coverage activated! 🛡️",
  "Your dentist would be proud - show those pearly whites! 🦷",
  "Attention: Smile shortage detected in your area! 🚨😄",
  "Today's weather: 100% chance of smiles with scattered giggles! 🌤️",
  "Smile banking: Make a deposit, get instant happiness returns! 🏦😊",
];

class SmiloWidget {
  constructor() {
    this.fm = FileManager.iCloud();
    this.dataPath = this.fm.joinPath(this.fm.documentsDirectory(), "Smilo");
    this.settingsFile = this.fm.joinPath(this.dataPath, "settings.json");
    this.dataFile = this.fm.joinPath(this.dataPath, "smiles.json");

    this.ensureDataDirectory();
    this.settings = this.loadSettings();
  }

  ensureDataDirectory() {
    if (!this.fm.fileExists(this.dataPath)) {
      this.fm.createDirectory(this.dataPath, true);
    }
  }

  loadSettings() {
    if (this.fm.fileExists(this.settingsFile)) {
      const data = this.fm.readString(this.settingsFile);
      return { ...WIDGET_CONFIG.defaultSettings, ...JSON.parse(data) };
    }
    return WIDGET_CONFIG.defaultSettings;
  }

  saveSettings() {
    this.fm.writeString(this.settingsFile, JSON.stringify(this.settings));
  }

  loadSmileData() {
    if (this.fm.fileExists(this.dataFile)) {
      const data = this.fm.readString(this.dataFile);
      return JSON.parse(data);
    }
    return [];
  }

  saveSmileData(data) {
    this.fm.writeString(this.dataFile, JSON.stringify(data));
  }

  addSmile() {
    const smiles = this.loadSmileData();
    smiles.push(new Date().toISOString());
    this.saveSmileData(smiles);
  }

  getTodaysSmiles() {
    const smiles = this.loadSmileData();
    const today = new Date().toDateString();
    return smiles.filter((smile) => new Date(smile).toDateString() === today)
      .length;
  }

  getAllTimeStats() {
    const smiles = this.loadSmileData();
    const now = new Date();

    // Get smiles for different periods
    const periods = {
      yesterday: 1,
      week: 7,
      month: 30,
      year: 365,
    };

    const stats = {};

    for (const [period, days] of Object.entries(periods)) {
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      if (period === "yesterday") {
        // Special case for yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        stats[period] = smiles.filter(
          (smile) => new Date(smile).toDateString() === yesterdayStr
        ).length;
      } else {
        stats[period] = smiles.filter(
          (smile) => new Date(smile) >= cutoffDate
        ).length;
      }
    }

    stats.currentStreak = this.getCurrentStreak();
    return stats;
  }

  getDailyGoalAchievements(daysBack) {
    const smiles = this.loadSmileData();
    let achievements = 0;

    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayString = date.toDateString();

      const daySmiles = smiles.filter(
        (smile) => new Date(smile).toDateString() === dayString
      ).length;

      if (daySmiles >= this.settings.dailyGoal) {
        achievements++;
      }
    }

    return achievements;
  }

  getCurrentStreak() {
    const smiles = this.loadSmileData();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      // Check last year max
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayString = date.toDateString();

      const daySmiles = smiles.filter(
        (smile) => new Date(smile).toDateString() === dayString
      ).length;

      if (daySmiles >= this.settings.dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getProgressEmoji(progress) {
    const index = Math.min(
      Math.floor(progress / 25),
      WIDGET_CONFIG.emojis.length - 1
    );
    return WIDGET_CONFIG.emojis[index];
  }

  getMotivationalMessage(todaySmiles) {
    let messages;

    if (todaySmiles === 0) {
      messages = WIDGET_CONFIG.motivationalMessages.noSmiles;
    } else if (todaySmiles < this.settings.dailyGoal) {
      messages = WIDGET_CONFIG.motivationalMessages.progress;
    } else {
      messages = WIDGET_CONFIG.motivationalMessages.goalReached;
    }

    // Use a better random selection that changes more often
    const now = new Date();
    const seed = now.getDate() + now.getHours() + todaySmiles;
    const index = seed % messages.length;

    return messages[index];
  }

  getProgressColor(progress) {
    const isDark = Device.isUsingDarkAppearance();
    const colorScheme = WIDGET_CONFIG.colors[this.settings.color];
    return isDark ? colorScheme.dark : colorScheme.light;
  }

  getBackgroundColor(progress) {
    const isDark = Device.isUsingDarkAppearance();
    const colorHex = this.getProgressColor(progress);

    // Create subtle background based on progress
    const alpha = isDark
      ? Math.min(0.15, progress / 400)
      : Math.min(0.1, progress / 500);

    return new Color(colorHex, alpha);
  }

  async showSmileConfirmation() {
    const alert = new Alert();
    alert.title = "Smile Moment! 😊";
    alert.message = "Did you take a moment to smile?";
    alert.addAction("Yes! 😄");
    alert.addCancelAction("Not yet");

    const result = await alert.presentAlert();
    if (result === 0) {
      this.addSmile();

      const successAlert = new Alert();
      successAlert.title = "Smile Recorded! ✨";
      successAlert.message = "Your smile makes the world a little brighter!";
      successAlert.addAction("Great!");
      await successAlert.presentAlert();
    }
  }

  async showGoalAchievedMessage() {
    const messages = [
      "Amazing! You've reached your daily goal! 🌟",
      "Goal achieved! Your smile made someone's day better 💫",
      "Fantastic! You're spreading joy today! ✨",
      "Daily goal complete! Keep that beautiful smile! 😄",
      "Well done! Your positive energy is contagious! 🎉",
      "Incredible! You're a smile superstar today! ⭐",
      "Mission accomplished! Your happiness is infectious! 🚀",
      "Brilliant! You've mastered the art of smiling! 🎨",
      "Outstanding! Your joy is lighting up the world! 💡",
      "Spectacular! You're a happiness ambassador! 🌈",
      "Magnificent! Your smile streak is on fire! 🔥",
      "Wonderful! You've unlocked maximum joy today! 🔓",
      "Excellent! Your positivity meter is maxed out! 📊",
      "Superb! You're spreading sunshine everywhere! ☀️",
      "Phenomenal! Your smile game is absolutely legendary! 🏆",
      "Marvelous! You've achieved smile perfection today! 💎",
    ];

    const alert = new Alert();
    alert.title = "Daily Goal Achieved! 🎯";
    alert.message = messages[Math.floor(Math.random() * messages.length)];
    alert.addAction("Awesome!");
    await alert.presentAlert();
  }

  async showSettingsMenu() {
    const alert = new Alert();
    alert.title = "Smilo Settings ⚙️";
    alert.addAction("Change Daily Goal");
    alert.addAction("Change Color Theme");
    alert.addAction("Toggle Notifications");
    alert.addAction("View Statistics");
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();

    switch (choice) {
      case 0:
        await this.changeDailyGoal();
        break;
      case 1:
        await this.changeColorTheme();
        break;
      case 2:
        await this.toggleNotifications();
        break;
      case 3:
        await this.showStatistics();
        break;
    }
  }

  async changeDailyGoal() {
    const alert = new Alert();
    alert.title = "Daily Smile Goal";
    alert.message = "How many smiles per day?";
    alert.addTextField("Goal", this.settings.dailyGoal.toString());
    alert.addAction("Save");
    alert.addCancelAction("Cancel");

    const result = await alert.presentAlert();
    if (result === 0) {
      const newGoal = parseInt(alert.textFieldValue(0));
      if (newGoal > 0 && newGoal <= 20) {
        this.settings.dailyGoal = newGoal;
        this.saveSettings();
      }
    }
  }

  async changeColorTheme() {
    const alert = new Alert();
    alert.title = "Choose Color Theme";
    alert.addAction("🟢 Green");
    alert.addAction("🔵 Blue");
    alert.addAction("🟠 Orange");
    alert.addAction("🟡 Yellow");
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();
    const colors = ["green", "blue", "orange", "yellow"];

    if (choice >= 0 && choice < colors.length) {
      this.settings.color = colors[choice];
      this.saveSettings();
    }
  }

  async toggleNotifications() {
    const alert = new Alert();
    alert.title = "Notification Settings";
    alert.message = `Currently ${
      this.settings.notificationsEnabled ? "enabled" : "disabled"
    }`;

    if (this.settings.notificationsEnabled) {
      alert.addDestructiveAction("Turn Off Notifications");
      alert.addAction("Manage Times");
    } else {
      alert.addAction("Turn On Notifications");
    }
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();

    if (!this.settings.notificationsEnabled && choice === 0) {
      // Turn on notifications
      this.settings.notificationsEnabled = true;
      this.saveSettings();

      const successAlert = new Alert();
      successAlert.title = "Notifications Enabled! 🔔";
      successAlert.message =
        "You'll receive smile reminders at 9:00 AM and 3:00 PM";
      successAlert.addAction("Great!");
      successAlert.addAction("Change Times");

      const timeChoice = await successAlert.presentAlert();
      if (timeChoice === 1) {
        await this.manageNotificationTimes();
      }
    } else if (this.settings.notificationsEnabled) {
      if (choice === 0) {
        // Turn off notifications
        this.settings.notificationsEnabled = false;
        this.saveSettings();
      } else if (choice === 1) {
        // Manage times
        await this.manageNotificationTimes();
      }
    }
  }

  async manageNotificationTimes() {
    while (true) {
      const alert = new Alert();
      alert.title = "Notification Times ⏰";

      const currentTimes = this.settings.notificationTimes;
      if (currentTimes.length === 0) {
        alert.message = "No notification times set";
      } else {
        alert.message = `Current times:\n${currentTimes.join("\n")}`;
      }

      alert.addAction("Add New Time");
      if (currentTimes.length > 0) {
        alert.addAction("Remove Time");
        alert.addAction("Use Preset Times");
      } else {
        alert.addAction("Use Preset Times");
      }
      alert.addCancelAction("Done");

      const choice = await alert.presentAlert();

      if (choice === 0) {
        // Add new time
        await this.addNotificationTime();
      } else if (choice === 1 && currentTimes.length > 0) {
        // Remove time
        await this.removeNotificationTime();
      } else if (
        (choice === 1 && currentTimes.length === 0) ||
        (choice === 2 && currentTimes.length > 0)
      ) {
        // Use presets
        await this.usePresetTimes();
      } else {
        // Done
        break;
      }
    }
  }

  async addNotificationTime() {
    const alert = new Alert();
    alert.title = "Add Notification Time";
    alert.message = "Choose a convenient time:";

    const presetTimes = [
      "07:00",
      "08:00",
      "09:00",
      "12:00",
      "15:00",
      "17:00",
      "19:00",
      "21:00",
    ];
    const availableTimes = presetTimes.filter(
      (time) => !this.settings.notificationTimes.includes(time)
    );

    if (availableTimes.length > 0) {
      availableTimes.forEach((time) => alert.addAction(time));
      alert.addAction("Custom Time");
    } else {
      alert.addAction("Custom Time");
    }
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();

    if (choice < availableTimes.length) {
      // Preset time selected
      this.settings.notificationTimes.push(availableTimes[choice]);
      this.settings.notificationTimes.sort();
      this.saveSettings();
    } else if (
      (availableTimes.length > 0 && choice === availableTimes.length) ||
      (availableTimes.length === 0 && choice === 0)
    ) {
      // Custom time
      await this.addCustomTime();
    }
  }

  async addCustomTime() {
    const alert = new Alert();
    alert.title = "Custom Time";
    alert.message = "Enter time in HH:MM format (24-hour)\nExample: 14:30";
    alert.addTextField("Time", "09:00");
    alert.addAction("Add");
    alert.addCancelAction("Cancel");

    const result = await alert.presentAlert();
    if (result === 0) {
      const timeText = alert.textFieldValue(0).trim();
      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeText)) {
        const formattedTime = timeText.padStart(5, "0");
        if (!this.settings.notificationTimes.includes(formattedTime)) {
          this.settings.notificationTimes.push(formattedTime);
          this.settings.notificationTimes.sort();
          this.saveSettings();
        }
      } else {
        const errorAlert = new Alert();
        errorAlert.title = "Invalid Time";
        errorAlert.message = "Please enter time in HH:MM format (e.g., 09:30)";
        errorAlert.addAction("OK");
        await errorAlert.presentAlert();
      }
    }
  }

  async removeNotificationTime() {
    const alert = new Alert();
    alert.title = "Remove Time";
    alert.message = "Which time would you like to remove?";

    this.settings.notificationTimes.forEach((time) => {
      alert.addDestructiveAction(time);
    });
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();

    if (choice >= 0 && choice < this.settings.notificationTimes.length) {
      this.settings.notificationTimes.splice(choice, 1);
      this.saveSettings();
    }
  }

  async usePresetTimes() {
    const alert = new Alert();
    alert.title = "Preset Times";
    alert.message = "Choose a preset schedule:";

    alert.addAction("Morning & Afternoon\n(9:00, 15:00)");
    alert.addAction("Three Times Daily\n(9:00, 13:00, 17:00)");
    alert.addAction("Work Hours\n(8:00, 12:00, 16:00)");
    alert.addAction("Evening Only\n(19:00)");
    alert.addCancelAction("Cancel");

    const choice = await alert.presentAlert();

    const presets = [
      ["09:00", "15:00"],
      ["09:00", "13:00", "17:00"],
      ["08:00", "12:00", "16:00"],
      ["19:00"],
    ];

    if (choice >= 0 && choice < presets.length) {
      this.settings.notificationTimes = presets[choice];
      this.saveSettings();
    }
  }

  async showStatistics() {
    const stats = this.getAllTimeStats();
    const todaySmiles = this.getTodaysSmiles();

    const alert = new Alert();
    alert.title = "🎭 Your Happiness Journey";
    alert.message = `Today: ${todaySmiles}/${this.settings.dailyGoal} smiles

🌟 Smile History:
• Yesterday: ${stats.yesterday} smiles
• This week: ${stats.week} smiles
• This month: ${stats.month} smiles
• This year: ${stats.year} smiles

🔥 Current streak: ${stats.currentStreak} days

Your joy is contagious! 😊`;
    alert.addAction("Amazing!");
    await alert.presentAlert();
  }

  createWidget() {
    const widget = new ListWidget();
    const todaySmiles = this.getTodaysSmiles();
    const progress = Math.min(
      (todaySmiles / this.settings.dailyGoal) * 100,
      100
    );
    widget.setPadding(10, 0, 0, 0);

    // Set background to transparent/subtle
    widget.backgroundColor = this.getBackgroundColor(progress);

    // Create a simple centered layout
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.centerAlignContent();

    // Add small top spacing
    mainStack.addSpacer(0);

    // Create horizontal container for centering the text
    const textStack = mainStack.addStack();
    textStack.layoutHorizontally();
    textStack.centerAlignContent();
    textStack.addSpacer();

    // Add motivational text
    const messageText = textStack.addText(
      this.getMotivationalMessage(todaySmiles)
    );
    messageText.textColor = new Color(this.getProgressColor(progress));
    messageText.font = Font.semiboldSystemFont(14);
    messageText.centerAlignText();

    textStack.addSpacer();

    // Create horizontal container for centering
    const centerStack = mainStack.addStack();
    centerStack.layoutHorizontally();
    centerStack.centerAlignContent();
    centerStack.addSpacer();

    // Create the complete ring+emoji image
    const size = 320;
    const completeImage = this.createProgressRingWithEmoji(progress, size);

    // Add the complete image
    const img = centerStack.addImage(completeImage);
    img.centerAlignImage();

    centerStack.addSpacer();

    // Add bottom spacing to balance the layout
    //     mainStack.addSpacer(8)

    return widget;
  }

  createProgressRingWithEmoji(progress, size) {
    const context = new DrawContext();
    context.size = new Size(size, size);
    context.opaque = false;
    context.respectScreenScale = true;

    const center = size / 2;
    const radius = size * 0.4;
    const lineWidth = size * 0.1;

    // Background ring (light gray circle)
    context.setStrokeColor(new Color("#E5E5E7", 0.5));
    context.setLineWidth(lineWidth);

    const backgroundPath = new Path();
    // Draw full circle
    for (let i = 0; i <= 60; i++) {
      const angle = (2 * Math.PI * i) / 60 - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      if (i === 0) {
        backgroundPath.move(new Point(x, y));
      } else {
        backgroundPath.addLine(new Point(x, y));
      }
    }

    context.addPath(backgroundPath);
    context.strokePath();

    // Progress ring (colored arc)
    if (progress > 0) {
      const progressAngle = (2 * Math.PI * progress) / 100;
      const steps = Math.max(10, Math.floor(progressAngle * 20));

      context.setStrokeColor(new Color(this.getProgressColor(progress)));
      context.setLineWidth(lineWidth);

      const progressPath = new Path();

      // Draw progress arc
      for (let i = 0; i <= steps; i++) {
        const angle = -Math.PI / 2 + (progressAngle * i) / steps;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        if (i === 0) {
          progressPath.move(new Point(x, y));
        } else {
          progressPath.addLine(new Point(x, y));
        }
      }

      context.addPath(progressPath);
      context.strokePath();
    }

    // Draw emoji in the center
    context.setTextAlignedCenter();
    context.setFont(Font.systemFont(120));
    context.setTextColor(Color.black());

    const emoji = this.getProgressEmoji(progress);
    // Adjust positioning to center emoji better within the ring
    const emojiRect = new Rect(0, size * 0.28, size, size);
    context.drawTextInRect(emoji, emojiRect);

    return context.getImage();
  }

  async scheduleNotifications() {
    if (!this.settings.notificationsEnabled) return;

    // Clear existing notifications
    const existingNotifications = await Notification.allPending();
    for (const notification of existingNotifications) {
      if (notification.identifier.startsWith("smile-reminder")) {
        await notification.remove();
      }
    }

    // Schedule new notifications
    for (let i = 0; i < 7; i++) {
      // Schedule for next 7 days
      const date = new Date();
      date.setDate(date.getDate() + i);

      for (const timeString of this.settings.notificationTimes) {
        const [hours, minutes] = timeString.split(":").map(Number);
        const notificationDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hours,
          minutes
        );

        if (notificationDate > new Date()) {
          // Only future notifications
          const notification = new Notification();
          notification.identifier = `smile-reminder-${i}-${timeString}`;

          // Random emoji for title variety
          const titleEmojis = ["😊", "😇", "☺️", "😁", "🤭"];
          const randomEmoji =
            titleEmojis[Math.floor(Math.random() * titleEmojis.length)];

          notification.title = `Smily ${randomEmoji}`;
          notification.body =
            NOTIFICATION_MESSAGES[
              Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)
            ];
          notification.sound = "default";
          notification.openURL = "scriptable:///run/Smilo?action=widget";
          notification.setTriggerDate(notificationDate);
          await notification.schedule();
        }
      }
    }
  }

  async handleWidgetClick() {
    const todaySmiles = this.getTodaysSmiles();

    if (todaySmiles >= this.settings.dailyGoal) {
      await this.showGoalAchievedMessage();
    } else {
      await this.showSmileConfirmation();
    }
  }
}

// Main execution
const smileWidget = new SmiloWidget();

if (config.runsInWidget) {
  const widget = smileWidget.createWidget();
  Script.setWidget(widget);
} else {
  // Handle different contexts: app run, shortcuts, or URL schemes
  const urlAction = args.queryParameters
    ? args.queryParameters["action"]
    : null;

  if (urlAction === "widget") {
    // Show settings menu when specifically requested via URL parameter
    await smileWidget.handleWidgetClick();
  } else if (
    config.runsInApp &&
    !config.runsWithSiri &&
    args.queryParameters === null
  ) {
    // Show settings only when running directly in Scriptable app with no parameters
    await smileWidget.showSettingsMenu();
  } else {
    // Handle widget click (from shortcuts or widget interaction)
    await smileWidget.showSettingsMenu();
  }
}

// Schedule notifications (runs in background)
if (config.runsInWidget) {
  await smileWidget.scheduleNotifications();
}
Script.complete();
