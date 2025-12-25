<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrameId = null
let particles = []
const particleCount = 100

const initParticles = (width, height) => {
  particles = []
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1, // radius 1-4
      d: Math.random() * particleCount, // density
      s: Math.random() * 1 + 0.5 // speed
    })
  }
}

const draw = () => {
  if (!ctx || !canvas.value) return
  
  const width = canvas.value.width
  const height = canvas.value.height
  
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.beginPath()
  
  for (let i = 0; i < particleCount; i++) {
    const p = particles[i]
    ctx.moveTo(p.x, p.y)
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true)
  }
  
  ctx.fill()
  update(width, height)
  animationFrameId = requestAnimationFrame(draw)
}

const update = (width, height) => {
  for (let i = 0; i < particleCount; i++) {
    const p = particles[i]
    p.y += p.s
    
    // Wind effect
    p.x += Math.sin(p.d) * 0.5

    if (p.x > width + 5 || p.x < -5 || p.y > height) {
      if (i % 3 > 0) { // 66.67% of the flakes
        particles[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d, s: p.s }
      } else {
        // If the flake is exiting from the right
        if (Math.sin(p.d) > 0) {
          // Enter from the left
          particles[i] = { x: -5, y: Math.random() * height, r: p.r, d: p.d, s: p.s }
        } else {
          // Enter from the right
          particles[i] = { x: width + 5, y: Math.random() * height, r: p.r, d: p.d, s: p.s }
        }
      }
    }
  }
}

const handleResize = () => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    // Re-distribute particles mostly to avoid stretching, 
    // but here keeping existing ones is fine or we can re-init.
    // Let's just ensure canvas size is correct.
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    initParticles(window.innerWidth, window.innerHeight)
    draw()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>

<style scoped>
.snow-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Click through */
  z-index: 9998;
}
</style>
