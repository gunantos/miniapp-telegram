import { db } from '../src/lib/db'

async function main() {
  // Create sample videos
  const videos = [
    {
      title: "Drama Pendek: Cinta Pertama",
      description: "Kisah cinta pertama yang menyentuh hati antara dua remaja yang bertemu di sekolah",
      thumbnailId: "thumbnail1",
      status: "PUBLISH",
      viewCount: 1250,
      category: "DRAMA_PENDEK",
      videoSource: "TELEGRAM",
      telegramFileId: "file123",
    },
    {
      title: "Drama Pendek: Pertemuan Tak Terduga",
      description: "Seorang wanita bertemu kembali dengan masa lalunya yang misterius",
      thumbnailId: "thumbnail2",
      status: "PUBLISH",
      viewCount: 890,
      category: "DRAMA_PENDEK",
      videoSource: "WEBSITE",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      title: "Drama Pendek: Short Real Story",
      description: "Kisah inspiratif tentang kehidupan sehari-hari yang penuh makna",
      thumbnailId: "thumbnail9",
      status: "PUBLISH",
      viewCount: 2100,
      category: "DRAMA_PENDEK",
      videoSource: "WEBSITE",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", // Portrait style video
    },
    {
      title: "Film Action: The Hero",
      description: "Film aksi penuh dengan adegan menegangkan tentang seorang pahlawan yang menyelamatkan kota",
      thumbnailId: "thumbnail3",
      status: "PUBLISH",
      viewCount: 3400,
      category: "FILM",
      videoSource: "WEBSITE",
      videoUrl: "https://tv10.idlixku.com/movie/",
    },
    {
      title: "Film Horor: Rumah Angker",
      description: "Kisah menyeramkan tentang rumah tua yang berhantu",
      thumbnailId: "thumbnail4",
      status: "PUBLISH",
      viewCount: 2100,
      category: "FILM",
      videoSource: "TELEGRAM",
      telegramFileId: "file456",
    },
    {
      title: "Serial Komedi: Keluarga Bahagia",
      description: "Serial komedi tentang kehidupan keluarga yang penuh canda tawa",
      thumbnailId: "thumbnail5",
      status: "PUBLISH",
      viewCount: 5600,
      category: "SERIAL",
      videoSource: "WEBSITE",
      videoUrl: "https://tv10.idlixku.com/tvseries/",
    },
    {
      title: "Serial Drama: Kisah Cinta Abadi",
      description: "Drama romantis yang mengharukan tentang cinta sejati",
      thumbnailId: "thumbnail6",
      status: "PUBLISH",
      viewCount: 4200,
      category: "SERIAL",
      videoSource: "WEBSITE",
      videoUrl: "https://tv10.idlixku.com/tvseries/",
    },
    {
      title: "Kartun: Petualangan Mickey",
      description: "Kartun petualangan seru untuk anak-anak bersama Mickey dan teman-temannya",
      thumbnailId: "thumbnail7",
      status: "PUBLISH",
      viewCount: 8900,
      category: "KARTUN",
      videoSource: "WEBSITE",
      videoUrl: "https://tv10.idlixku.com/genre/anime/",
    },
    {
      title: "Kartun: Edukasi Anak",
      description: "Kartun edukatif yang mengajarkan angka dan huruf dengan cara yang menyenangkan",
      thumbnailId: "thumbnail8",
      status: "PUBLISH",
      viewCount: 6700,
      category: "KARTUN",
      videoSource: "WEBSITE",
      videoUrl: "https://tv10.idlixku.com/genre/anime/",
    }
  ]

  // Insert videos
  for (const videoData of videos) {
    const video = await db.video.create({
      data: videoData
    })
    console.log(`Created video: ${video.title}`)

    // Add serial parts for serial videos
    if (video.category === 'SERIAL') {
      const parts = [
        { videoFileId: `${video.videoUrl}_part1`, partNumber: 1, viewCount: Math.floor(video.viewCount * 0.3) },
        { videoFileId: `${video.videoUrl}_part2`, partNumber: 2, viewCount: Math.floor(video.viewCount * 0.25) },
        { videoFileId: `${video.videoUrl}_part3`, partNumber: 3, viewCount: Math.floor(video.viewCount * 0.2) }
      ]

      for (const partData of parts) {
        await db.serialPart.create({
          data: {
            ...partData,
            serialId: video.id
          }
        })
      }
      console.log(`Added 3 parts for video: ${video.title}`)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })