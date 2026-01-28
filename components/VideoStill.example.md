# VideoStill Component Usage

A reusable component for displaying video thumbnails/stills that open in a modal when clicked.

## Basic Usage

### YouTube Video
```tsx
import { VideoStill } from '@/components/VideoStill'

// Using YouTube video ID
<VideoStill 
  youtubeId="dQw4w9WgXcQ"
  title="My Video Title"
  alt="Description of video"
/>

// Or using full YouTube URL
<VideoStill 
  youtubeId="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="My Video Title"
/>
```

### Vimeo Video
```tsx
<VideoStill 
  vimeoId="123456789"
  title="My Vimeo Video"
/>

// Or with full URL
<VideoStill 
  vimeoId="https://vimeo.com/123456789"
  title="My Vimeo Video"
/>
```

### Self-hosted Video
```tsx
<VideoStill 
  videoUrl="/videos/my-video.mp4"
  thumbnail="/thumbnails/my-video-thumb.jpg"
  title="My Self-hosted Video"
/>
```

## Custom Styling

```tsx
<VideoStill 
  youtubeId="dQw4w9WgXcQ"
  className={styles.customVideo}
  aspectRatio={4 / 3} // Custom aspect ratio
  showPlayButton={true} // Show/hide play button
/>
```

## Example: Adding to Art Gallery

```tsx
// app/art-gallery/page.tsx
import { VideoStill } from '@/components/VideoStill'

export default function ArtGalleryPage() {
  return (
    <div className={styles.container}>
      <h1>art gallery</h1>
      
      <div className={styles.gallery}>
        <VideoStill 
          youtubeId="@byjustinwu"
          title="My YouTube Video"
          aspectRatio={16 / 9}
        />
      </div>
    </div>
  )
}
```

## Example: Adding to Projects Section

```tsx
// app/me/page.tsx
import { VideoStill } from '@/components/VideoStill'

const projects = [
  {
    id: 'video-project',
    title: 'Video Project',
    date: "Jan '26",
    description: 'A video project description',
    video: true, // Flag to indicate it's a video
    youtubeId: 'dQw4w9WgXcQ',
  },
  // ... other projects
]

// In your render:
{project.video ? (
  <VideoStill 
    youtubeId={project.youtubeId}
    title={project.title}
    aspectRatio={16 / 10}
  />
) : (
  <ProjectCard {...project} />
)}
```

## Props

- `youtubeId?: string` - YouTube video ID or URL
- `vimeoId?: string` - Vimeo video ID or URL  
- `videoUrl?: string` - Self-hosted video URL
- `thumbnail?: string` - Custom thumbnail image (optional)
- `alt?: string` - Alt text for thumbnail
- `title?: string` - Video title (shown as overlay)
- `showPlayButton?: boolean` - Show play button overlay (default: true)
- `className?: string` - Custom CSS class
- `aspectRatio?: number` - Aspect ratio (default: 16/9)
