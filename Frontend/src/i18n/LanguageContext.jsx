import { useEffect, useMemo, useState } from 'react'
import translations from './translations'
import { LanguageContext } from './language-context'

const defaultLanguage = 'en'
const storageKey = 'easytrip-language'
const getTranslation = (language, key) => {
  const readValue = (source) =>
    key.split('.').reduce((value, part) => value?.[part], source)

  return (
    readValue(translations[language]) ??
    readValue(translations[defaultLanguage]) ??
    key
  )
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem(storageKey)
    return savedLanguage === 'it' ? 'it' : defaultLanguage
  })

  useEffect(() => {
    localStorage.setItem(storageKey, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => getTranslation(language, key),
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
