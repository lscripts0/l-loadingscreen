Media for l-loadingscreen (paths must match html/settings.json):

  bg.mp4              -> background video  (background.type = "video")
  bg.png, bg2.png ... -> background images (background.type = "image",
                         background.images = ["media/bg.png","media/bg2.png", ...])
                         With more than 1 image, arrow buttons appear to switch.
  music/*.mp3         -> music (add to audio.tracks, e.g.
                         "media/music/song.mp3"). A player with play/pause/skip/back
                         + volume appears when audio.source = "playlist".
  team/*.png          -> team images (settings.json team.members[].image,
                         e.g. "media/team/nico.png"). If the image is missing -> no picture.
