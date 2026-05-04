<template>
  <div class="logo-container">
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #fa5baf; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #e83e8c; stop-opacity: 1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Animated background circles -->
      <circle cx="60" cy="60" r="55" fill="url(#logoGradient)" opacity="0.08" />
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="url(#logoGradient)"
        stroke-width="1"
        opacity="0.3"
      />
      <circle
        cx="60"
        cy="60"
        r="45"
        fill="none"
        stroke="url(#logoGradient)"
        stroke-width="1.5"
        opacity="0.6"
      />

      <!-- Main clock circle background -->
      <circle cx="60" cy="60" r="38" fill="white" filter="url(#glow)" />

      <!-- Inner decorative ring -->
      <circle
        cx="60"
        cy="60"
        r="35"
        fill="none"
        stroke="url(#logoGradient)"
        stroke-width="0.5"
        opacity="0.4"
      />

      <!-- Hour markers - stylish dots -->
      <circle cx="60" cy="27" r="1.8" fill="#E83E8C" />
      <circle cx="93" cy="60" r="1.8" fill="#E83E8C" />
      <circle cx="60" cy="93" r="1.8" fill="#E83E8C" />
      <circle cx="27" cy="60" r="1.8" fill="#E83E8C" />

      <!-- Hour hand (pointing to 10) -->
      <line
        x1="60"
        y1="60"
        x2="48"
        y2="35"
        stroke="url(#logoGradient)"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- Minute hand (pointing to 2) -->
      <line
        x1="60"
        y1="60"
        x2="80"
        y2="43"
        stroke="url(#logoGradient)"
        stroke-width="2.5"
        stroke-linecap="round"
      />

      <!-- Second hand - subtle -->
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="25"
        stroke="#FA5BAF"
        stroke-width="1"
        stroke-linecap="round"
        opacity="0.5"
      />

      <!-- Center dot with glow effect -->
      <circle cx="60" cy="60" r="3.5" fill="url(#logoGradient)" filter="url(#glow)" />
      <circle cx="60" cy="60" r="1.5" fill="white" />

      <!-- Bottom people section with improved styling -->
      <!-- Left person head -->
      <circle cx="42" cy="82" r="3.5" fill="#FA5BAF" />
      <!-- Left person body -->
      <path d="M 42 85.5 L 40 92 L 44 92 L 42 91 L 42 85.5" fill="#FA5BAF" opacity="0.9" />

      <!-- Right person head -->
      <circle cx="78" cy="82" r="3.5" fill="#E83E8C" />
      <!-- Right person body -->
      <path d="M 78 85.5 L 76 92 L 80 92 L 78 91 L 78 85.5" fill="#E83E8C" opacity="0.9" />

      <!-- Connection plus sign with better styling -->
      <line
        x1="60"
        y1="78"
        x2="60"
        y2="90"
        stroke="url(#logoGradient)"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <line
        x1="54"
        y1="84"
        x2="66"
        y2="84"
        stroke="url(#logoGradient)"
        stroke-width="1.2"
        stroke-linecap="round"
      />

      <!-- Decorative accent lines -->
      <path
        d="M 42 77 Q 50 74 60 78"
        stroke="url(#logoGradient)"
        stroke-width="0.8"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M 78 77 Q 70 74 60 78"
        stroke="url(#logoGradient)"
        stroke-width="0.8"
        fill="none"
        opacity="0.4"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
// No script needed - pure visual component
</script>

<style scoped>
.logo-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-svg {
  width: 100%;
  height: 100%;
  max-width: 60px;
  max-height: 60px;
  filter: drop-shadow(0 2px 4px rgba(250, 91, 175, 0.2));
  transition: transform 0.3s ease;
}

.logo-svg:hover {
  transform: scale(1.05);
}
</style>
