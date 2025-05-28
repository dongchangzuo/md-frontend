import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.text};
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text};
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 16px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.border};
    transition: .4s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.primary};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

function Settings({ language }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    language: language,
    theme: themeMode,
    autoSave: true,
    fontSize: '16px',
    lineHeight: '1.75',
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    autoComplete: true,
    spellCheck: true
  });
  const t = lang[language];

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));

    // 处理特殊设置
    if (key === 'theme') {
      toggleTheme(value);
    }
  };

  return (
    <SettingsContainer>
      <Section>
        <SectionTitle>{t.generalSettings || 'General Settings'}</SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.language || 'Language'}</SettingTitle>
            <SettingDescription>{t.languageDescription || 'Choose your preferred language'}</SettingDescription>
          </SettingLabel>
          <Select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.theme || 'Theme'}</SettingTitle>
            <SettingDescription>{t.themeDescription || 'Choose your preferred theme'}</SettingDescription>
          </SettingLabel>
          <Select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="light">☀️ {t.light || 'Light'}</option>
            <option value="dark">🌙 {t.dark || 'Dark'}</option>
            <option value="auto">🖥️ {t.auto || 'Auto'}</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.autoSave || 'Auto Save'}</SettingTitle>
            <SettingDescription>{t.autoSaveDescription || 'Automatically save changes'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>{t.editorSettings || 'Editor Settings'}</SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.fontSize || 'Font Size'}</SettingTitle>
            <SettingDescription>{t.fontSizeDescription || 'Adjust the font size'}</SettingDescription>
          </SettingLabel>
          <Select
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.lineHeight || 'Line Height'}</SettingTitle>
            <SettingDescription>{t.lineHeightDescription || 'Adjust the line height'}</SettingDescription>
          </SettingLabel>
          <Select
            value={settings.lineHeight}
            onChange={(e) => handleSettingChange('lineHeight', e.target.value)}
          >
            <option value="1.5">1.5</option>
            <option value="1.75">1.75</option>
            <option value="2">2</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.tabSize || 'Tab Size'}</SettingTitle>
            <SettingDescription>{t.tabSizeDescription || 'Number of spaces for a tab'}</SettingDescription>
          </SettingLabel>
          <Select
            value={settings.tabSize}
            onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.wordWrap || 'Word Wrap'}</SettingTitle>
            <SettingDescription>{t.wordWrapDescription || 'Wrap long lines'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>{t.features || 'Features'}</SectionTitle>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.minimap || 'Minimap'}</SettingTitle>
            <SettingDescription>{t.minimapDescription || 'Show code minimap'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => handleSettingChange('minimap', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.lineNumbers || 'Line Numbers'}</SettingTitle>
            <SettingDescription>{t.lineNumbersDescription || 'Show line numbers'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={(e) => handleSettingChange('lineNumbers', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.autoComplete || 'Auto Complete'}</SettingTitle>
            <SettingDescription>{t.autoCompleteDescription || 'Enable auto completion'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.autoComplete}
              onChange={(e) => handleSettingChange('autoComplete', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingTitle>{t.spellCheck || 'Spell Check'}</SettingTitle>
            <SettingDescription>{t.spellCheckDescription || 'Enable spell checking'}</SettingDescription>
          </SettingLabel>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.spellCheck}
              onChange={(e) => handleSettingChange('spellCheck', e.target.checked)}
            />
            <span></span>
          </Toggle>
        </SettingItem>
      </Section>
    </SettingsContainer>
  );
}

export default Settings; 