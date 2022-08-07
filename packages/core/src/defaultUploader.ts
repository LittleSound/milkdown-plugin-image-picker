/* Copyright 2021, Milkdown by Mirone. */
export type Uploader = (files: FileList) => Promise<{ alt?: string; src: string }[] | undefined>

const readImageAsBase64 = (file: File): Promise<{ alt: string; src: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => {
        resolve({
          alt: file.name,
          src: reader.result as string,
        })
      },
      false,
    )
    reader.readAsDataURL(file)
  })
}

export const defaultUploader: Uploader = async (files) => {
  const imgs: File[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file)
      continue

    if (!file.type.includes('image'))
      continue

    imgs.push(file)
  }

  const data = await Promise.all(imgs.map(img => readImageAsBase64(img)))

  return data
}
