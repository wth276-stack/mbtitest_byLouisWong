import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, RefreshCw, User, UserCheck, CheckCircle2, BarChart3, Info, ClipboardCheck } from 'lucide-react';

/**
 * 數據來源：mbti2.pdf 完整校對
 * 特色：
 * 1. 包含 (A)(B)(C) 選項題目 (20, 24, 44, 49, 60)
 * 2. 嚴格執行性別 T 分數 +1 與同分判定 (I, N, F, P)
 */
const QUESTIONS = [
  { id: 1, text: "您通常是個:", options: [{ label: "(A) 容易和大家打成一片的人", type: "E", w: 2 }, { label: "(B) 較為沉默和保守的人", type: "I", w: 2 }] },
  { id: 2, text: "如果您是個教師,您會選擇教:", options: [{ label: "(A) 包含具體事實的課程", type: "S", w: 2 }, { label: "(B) 涉及理論的課程", type: "N", w: 2 }] },
  { id: 3, text: "通常您是讓您的:", options: [{ label: "(A) 感情支配理智", type: "F", w: 1 }, { label: "(B) 理智支配感情", type: "T", w: 2 }] },
  { id: 4, text: "當您要到某個地方去一整天時,您會:", options: [{ label: "(A) 計劃您所要做的事和時間", type: "J", w: 2 }, { label: "(B) 去了才打算", type: "P", w: 2 }] },
  { id: 5, text: "當您和一群人在一起時,通常您是:", options: [{ label: "(A) 參加大夥兒的談話", type: "E", w: 2 }, { label: "(B) 一次只和一個人說話", type: "I", w: 1 }] },
  { id: 6, text: "通常和您相處得較好的是:", options: [{ label: "(A) 富於想像的人", type: "N", w: 2 }, { label: "(B) 講求實際的人", type: "S", w: 1 }] },
  { id: 7, text: "您覺得較高的讚美是:", options: [{ label: "(A) 被稱為是一個真情流露的人", type: "F", w: 1 }, { label: "(B) 被稱為是一個始終有理性的人", type: "T", w: 2 }] },
  { id: 8, text: "您比較喜歡:", options: [{ label: "(A) 事先安排好約會時間、聚會等活動", type: "J", w: 1 }, { label: "(B) 到時候覺得甚麼好玩就做甚麼", type: "P", w: 2 }] },
  { id: 9, text: "在一個大團體裡面,您通常是:", options: [{ label: "(A) 介紹其他人", type: "E", w: 2 }, { label: "(B) 被人介紹", type: "I", w: 2 }] },
  { id: 10, text: "您比較喜歡被認為是:", options: [{ label: "(A) 一個講求實際的人", type: "S", w: 1 }, { label: "(B) 一個才華橫溢的人", type: "N", w: 2 }] },
  { id: 11, text: "您通常:", options: [{ label: "(A) 重視情感甚於邏輯", type: "F", w: 2 }, { label: "(B) 重視邏輯甚於情感", type: "T", w: 2 }] },
  { id: 12, text: "您比較善長於:", options: [{ label: "(A) 處理偶發事件,並且很快就知道該如何處置", type: "P", w: 2 }, { label: "(B) 遵循一個經過詳細設計的計劃行事", type: "J", w: 1 }] },
  { id: 13, text: "您傾向於:", options: [{ label: "(A) 與極少數人建立深厚的友誼", type: "I", w: 1 }, { label: "(B) 與許多人建立廣泛的交情", type: "E", w: 1 }] },
  { id: 14, text: "您比較欽羨:", options: [{ label: "(A) 循規蹈矩、不引人注目的人", type: "S", w: 1 }, { label: "(B) 獨立獨行、不在乎是否為人注意的人", type: "N", w: 1 }] },
  { id: 15, text: "您覺得人最糟糕的是:", options: [{ label: "(A) 沒有同情心", type: "F", w: 1 }, { label: "(B) 不講理", type: "T", w: 2 }] },
  { id: 16, text: "依照工作進度表行事,您會覺得:", options: [{ label: "(A) 正合心意", type: "J", w: 2 }, { label: "(B) 拘束、不自在", type: "P", w: 2 }] },
  { id: 17, text: "在朋友當中,您是:", options: [{ label: "(A) 最後知道事情的人之一", type: "I", w: 2 }, { label: "(B) 知道每個人的消息", type: "E", w: 1 }] },
  { id: 18, text: "您比較喜歡的朋友是:", options: [{ label: "(A) 常常有新的想法的人", type: "N", w: 1 }, { label: "(B) 腳踏實地的人", type: "S", w: 2 }] },
  { id: 19, text: "您寧可選擇和哪一種上司工作?", options: [{ label: "(A) 經常是和善的", type: "F", w: 2 }, { label: "(B) 經常是公平的", type: "T", w: 1 }] },
  { id: 20, text: "把在週末該做的事列在一張清單上,您會覺得:", options: [{ label: "(A) 正合心意", type: "J", w: 2 }, { label: "(B) 令您掃興", type: "P", w: 1 }, { label: "(C) 令您非常沮喪", type: "P", w: 2 }] },
  { id: 21, text: "您通常:", options: [{ label: "(A) 可以輕鬆地與任何人談話,不受時間的約束", type: "E", w: 2 }, { label: "(B) 只和某些人或在某些情況下,才會暢所欲言", type: "I", w: 2 }] },
  { id: 22, text: "選擇閱讀閒書時,您喜歡:", options: [{ label: "(A) 以古怪或獨創新鮮的表達方式", type: "N", w: 1 }, { label: "(B) 作者明確地說明他的意思", type: "S", w: 2 }] },
  { id: 23, text: "您覺得較大的錯誤是:", options: [{ label: "(A) 過於熱情", type: "T", w: 2 }, { label: "(B) 熱情不足", type: "F", w: 2 }] },
  { id: 24, text: "在每天的工作中,您是:", options: [{ label: "(A) 喜歡做那些要趕時間的緊急工作", type: "P", w: 1 }, { label: "(B) 不喜歡在壓力下工作", type: "P", w: 1 }, { label: "(C) 通常事先已有計劃,因而不致感到壓力", type: "J", w: 1 }] },
  { id: 25, text: "剛認識您的人,對您的興趣是:", options: [{ label: "(A) 很快就能明瞭", type: "E", w: 1 }, { label: "(B) 只有在真正和您熟識後才會明瞭", type: "I", w: 1 }] },
  { id: 26, text: "在做某些很多人在做的事情時,您比較喜歡:", options: [{ label: "(A) 以一般人所接受的方式進行", type: "S", w: 2 }, { label: "(B) 以自創的方式進行", type: "N", w: 1 }] },
  { id: 27, text: "您比較在乎:", options: [{ label: "(A) 別人的感覺", type: "F", w: 2 }, { label: "(B) 別人的權益", type: "T", w: 2 }] },
  { id: 28, text: "當有一件特別的事要您做時,您喜歡:", options: [{ label: "(A) 在開始之前仔細地規劃一下", type: "J", w: 2 }, { label: "(B) 邊做邊想該怎麼做", type: "P", w: 2 }] },
  { id: 29, text: "您通常:", options: [{ label: "(A) 會自然地表露您的感受", type: "E", w: 2 }, { label: "(B) 會將自己的感受藏起來", type: "I", w: 2 }] },
  { id: 30, text: "在您的生活方式中,您比較喜歡:", options: [{ label: "(A) 別出新裁", type: "N", w: 1 }, { label: "(B) 根據慣例", type: "S", w: 1 }] },
  { id: 31, text: "請選擇涵義符合心意的字：", options: [{ label: "溫和的", type: "F", w: 2 }, { label: "堅定的", type: "T", w: 2 }] },
  { id: 32, text: "當您被預定在某個時間內完成某件事時,您會覺得:", options: [{ label: "(A) 能按實際情況而作出計劃是愉快的", type: "P", w: 1 }, { label: "(B) 因受到束縛而有些不愉快", type: "J", w: 2 }] },
  { id: 33, text: "您認為:", options: [{ label: "(A) 比較一般人,您對各種事情的反應更為熱心", type: "E", w: 2 }, { label: "(B) 比較一般人,您對各種事情的反應比較不容易興奮", type: "I", w: 1 }] },
  { id: 34, text: "一個人能得到較崇高的稱讚,是因為他:", options: [{ label: "(A) 有遠見", type: "N", w: 2 }, { label: "(B) 通情達理", type: "S", w: 1 }] },
  { id: 35, text: "請選擇涵義符合心意的字：", options: [{ label: "思考", type: "T", w: 2 }, { label: "感受", type: "F", w: 2 }] },
  { id: 36, text: "您通常是:", options: [{ label: "(A) 寧可在最後一刻鐘趕工", type: "P", w: 2 }, { label: "(B) 覺得在最後一刻鐘趕工令自己緊張", type: "J", w: 2 }] },
  { id: 37, text: "在宴會上,您:", options: [{ label: "(A) 有時會感到乏味", type: "I", w: 2 }, { label: "(B) 時常玩得很高興", type: "E", w: 1 }] },
  { id: 38, text: "您認為比較重要的是:", options: [{ label: "(A) 能觀察一個情況下的多種可能性", type: "N", w: 2 }, { label: "(B) 能適應當時的情況與事實", type: "S", w: 2 }] },
  { id: 39, text: "請選擇涵義符合心意的字：", options: [{ label: "使人信服的", type: "T", w: 2 }, { label: "令人感動的", type: "F", w: 2 }] },
  { id: 40, text: "您認為每天的例行性公事是:", options: [{ label: "(A) 一種舒服的工作方式", type: "J", w: 2 }, { label: "(B) 儘管是必要的,仍令人厭煩", type: "P", w: 2 }] },
  { id: 41, text: "當一種事物流行起來時,您通常是:", options: [{ label: "(A) 首先嘗試它的人之一", type: "E", w: 2 }, { label: "(B) 對它沒甚麼興趣", type: "I", w: 2 }] },
  { id: 42, text: "您比較喜歡:", options: [{ label: "(A) 支持已經確定可以做好事情的方法", type: "S", w: 2 }, { label: "(B) 分析尚存的差錯以處理剩餘的問題", type: "N", w: 2 }] },
  { id: 43, text: "請選擇涵義符合心意的字：", options: [{ label: "分析", type: "T", w: 1 }, { label: "同情", type: "F", w: 2 }] },
  { id: 44, text: "當您想到您應該做些瑣事或買些零碎的物品時,您會:", options: [{ label: "(A) 常常健忘,到很遲的時候才想起來", type: "P", w: 2 }, { label: "(B) 通常把它們記在紙上以提醒自己", type: "J", w: 1 }, { label: "(C) 總是不需要提醒即做到", type: "J", w: 2 }] },
  { id: 45, text: "您是:", options: [{ label: "(A) 很容易讓人結交", type: "E", w: 2 }, { label: "(B) 不容易讓人結交", type: "I", w: 2 }] },
  { id: 46, text: "請選擇涵義符合心意的字：", options: [{ label: "事實", type: "S", w: 2 }, { label: "主意", type: "N", w: 1 }] },
  { id: 47, text: "請選擇涵義符合心意的字：", options: [{ label: "正義", type: "T", w: 2 }, { label: "憐憫", type: "F", w: 1 }] },
  { id: 48, text: "對您而言,較難適應的是:", options: [{ label: "(A) 例行公事", type: "P", w: 2 }, { label: "(B) 不斷的變化", type: "J", w: 1 }] },
  { id: 49, text: "當您處於窘境時,您通常會:", options: [{ label: "(A) 改變話題", type: "E", w: 1 }, { label: "(B) 把它變成一個笑話", type: "E", w: 2 }, { label: "(C) 幾天後才會想到當時該講的話", type: "I", w: 2 }] },
  { id: 50, text: "請選擇涵義符合心意的字：", options: [{ label: "陳述", type: "S", w: 2 }, { label: "概念", type: "N", w: 1 }] },
  { id: 51, text: "請選擇涵義符合心意的字：", options: [{ label: "同情", type: "F", w: 2 }, { label: "邏輯", type: "T", w: 2 }] },
  { id: 52, text: "當您開始執行一項必須在一週後完成的大計劃時,您會:", options: [{ label: "(A) 花時間依序編列各個工作項目", type: "J", w: 2 }, { label: "(B) 立刻投入工作", type: "P", w: 2 }] },
  { id: 53, text: "您認為和您親近的人:", options: [{ label: "(A) 能夠知道您對大多數事情的感受", type: "E", w: 2 }, { label: "(B) 只有當您因特殊原因向他們說明之後,他們才知道您的感受", type: "I", w: 1 }] },
  { id: 54, text: "請選擇涵義符合心意的字：", options: [{ label: "學理的", type: "N", w: 2 }, { label: "實用的", type: "S", w: 2 }] },
  { id: 55, text: "請選擇涵義符合心意的字：", options: [{ label: "講理", type: "T", w: 2 }, { label: "體諒", type: "F", w: 2 }] },
  { id: 56, text: "當您要完成一件工作時,您會:", options: [{ label: "(A) 儘早開始,以期在完成工作後還有剩餘的時間", type: "J", w: 2 }, { label: "(B) 在最後的時間里以最快的速度趕工", type: "P", w: 2 }] },
  { id: 57, text: "當您在一場社交集會中,您喜歡:", options: [{ label: "(A) 協助事物的進行", type: "J", w: 2 }, { label: "(B) 讓大家隨心所欲地歡樂", type: "P", w: 1 }] },
  { id: 58, text: "請選擇涵義符合心意的字：", options: [{ label: "照字義的", type: "S", w: 2 }, { label: "用比喻的", type: "N", w: 1 }] },
  { id: 59, text: "請選擇涵義符合心意的字：", options: [{ label: "決心", type: "T", w: 2 }, { label: "忠誠", type: "F", w: 1 }] },
  { id: 60, text: "如果有人問您即將在星期六上午做甚麼事,您會:", options: [{ label: "(A) 很有頭緒地陳述出來", type: "J", w: 2 }, { label: "(B) 列出雙倍的事項", type: "J", w: 1 }, { label: "(C) 到時才打算", type: "P", w: 2 }] },
  { id: 61, text: "請選擇涵義符合心意的字：", options: [{ label: "熱忱的", type: "E", w: 2 }, { label: "恬靜的", type: "I", w: 2 }] },
  { id: 62, text: "請選擇涵義符合心意的字：", options: [{ label: "想像的", type: "N", w: 2 }, { label: "實際的", type: "S", w: 2 }] },
  { id: 63, text: "請選擇涵義符合心意的字：", options: [{ label: "定意的", type: "T", w: 2 }, { label: "親切的", type: "F", w: 1 }] },
  { id: 64, text: "一天中那些比較例行性的事務給您的感覺是:", options: [{ label: "(A) 安定平靜", type: "J", w: 2 }, { label: "(B) 令人厭煩", type: "P", w: 2 }] },
  { id: 65, text: "請選擇涵義符合心意的字：", options: [{ label: "保守的", type: "I", w: 1 }, { label: "多話的", type: "E", w: 2 }] },
  { id: 66, text: "請選擇涵義符合心意的字：", options: [{ label: "製造", type: "S", w: 2 }, { label: "創造", type: "N", w: 1 }] },
  { id: 67, text: "請選擇涵義符合心意的字：", options: [{ label: "調解者", type: "F", w: 2 }, { label: "評審員", type: "T", w: 2 }] },
  { id: 68, text: "請選擇涵義符合心意的字：", options: [{ label: "預定的進度", type: "J", w: 2 }, { label: "沒有計劃的", type: "P", w: 1 }] },
  { id: 69, text: "請選擇涵義符合心意的字：", options: [{ label: "平靜的", type: "I", w: 1 }, { label: "活潑的", type: "E", w: 2 }] },
  { id: 70, text: "請選擇涵義符合心意的字：", options: [{ label: "明智的", type: "S", w: 2 }, { label: "迷人的", type: "N", w: 1 }] },
  { id: 71, text: "請選擇涵義符合心意的字：", options: [{ label: "軟", type: "F", w: 1 }, { label: "硬", type: "T", w: 2 }] },
  { id: 72, text: "請選擇涵義符合心意的字：", options: [{ label: "有系統的", type: "J", w: 2 }, { label: "自然發生的", type: "P", w: 2 }] },
  { id: 73, text: "請選擇涵義符合心意的字：", options: [{ label: "說", type: "E", w: 2 }, { label: "寫", type: "I", w: 1 }] },
  { id: 74, text: "請選擇涵義符合心意的字：", options: [{ label: "生產", type: "S", w: 1 }, { label: "設計", type: "N", w: 2 }] },
  { id: 75, text: "請選擇涵義符合心意的字：", options: [{ label: "原諒", type: "F", w: 1 }, { label: "容忍", type: "T", w: 2 }] },
  { id: 76, text: "請選擇涵義符合心意的字：", options: [{ label: "有系統的", type: "J", w: 2 }, { label: "偶然的", type: "P", w: 2 }] },
  { id: 77, text: "請選擇涵義符合心意的字：", options: [{ label: "愛交際的", type: "E", w: 2 }, { label: "冷淡的", type: "I", w: 1 }] },
  { id: 78, text: "請選擇涵義符合心意的字：", options: [{ label: "具體的", type: "S", w: 2 }, { label: "抽象的", type: "N", w: 1 }] },
  { id: 79, text: "請選擇涵義符合心意的字：", options: [{ label: "誰", type: "F", w: 1 }, { label: "甚麼", type: "T", w: 2 }] },
  { id: 80, text: "請選擇涵義符合心意的字：", options: [{ label: "衝動", type: "P", w: 2 }, { label: "決定", type: "J", w: 2 }] },
  { id: 81, text: "請選擇涵義符合心意的字：", options: [{ label: "社交集會", type: "E", w: 2 }, { label: "戲院", type: "I", w: 1 }] },
  { id: 82, text: "請選擇涵義符合心意的字：", options: [{ label: "建造", type: "S", w: 2 }, { label: "發明", type: "N", w: 1 }] },
  { id: 83, text: "請選擇涵義符合心意的字：", options: [{ label: "不批評的", type: "F", w: 1 }, { label: "批評的", type: "T", w: 2 }] },
  { id: 84, text: "請選擇涵義符合心意的字：", options: [{ label: "守時的", type: "J", w: 2 }, { label: "悠閒的", type: "P", w: 2 }] },
  { id: 85, text: "請選擇涵義符合心意的字：", options: [{ label: "根基", type: "S", w: 2 }, { label: "頂尖", type: "N", w: 1 }] },
  { id: 86, text: "請選擇涵義符合心意的字：", options: [{ label: "防範的", type: "T", w: 2 }, { label: "信任的", type: "F", w: 1 }] },
  { id: 87, text: "請選擇涵義符合心意的字：", options: [{ label: "變換的", type: "P", w: 2 }, { label: "永恆的", type: "J", w: 2 }] },
  { id: 88, text: "請選擇涵義符合心意的字：", options: [{ label: "理論", type: "N", w: 2 }, { label: "經驗", type: "S", w: 2 }] },
  { id: 89, text: "請選擇涵義符合心意的字：", options: [{ label: "贊同", type: "F", w: 1 }, { label: "討論", type: "T", w: 2 }] },
  { id: 90, text: "請選擇涵義符合心意的字：", options: [{ label: "井井有條", type: "J", w: 2 }, { label: "輕鬆自在", type: "P", w: 2 }] },
  { id: 91, text: "請選擇涵義符合心意的字：", options: [{ label: "標記", type: "S", w: 2 }, { label: "象徵", type: "N", w: 1 }] },
  { id: 92, text: "請選擇涵義符合心意的字：", options: [{ label: "迅速", type: "T", w: 1 }, { label: "小心", type: "F", w: 1 }] },
  { id: 93, text: "請選擇涵義符合心意的字：", options: [{ label: "接納", type: "S", w: 2 }, { label: "改變", type: "N", w: 1 }] },
  { id: 94, text: "請選擇涵義符合心意的字：", options: [{ label: "已知的", type: "T", w: 1 }, { label: "未知的", type: "F", w: 1 }] }
];

const DESCRIPTIONS = {
  ISTJ: { title: "自然管理員", trait: "務實、有序、可靠。您重視傳統與規則，是團隊中最穩定的基石。" },
  ISFJ: { title: "致力完成任務者", trait: "體貼、細心、負責。您安靜地支持著他人，對細節有極高的敏銳度。" },
  INFJ: { title: "激勵人心者", trait: "理想主義、深沉、有洞察力。您追求生命的意義，具備極強的直覺。" },
  INTJ: { title: "獨立思考者", trait: "戰略家、自信、高效。您是天生的謀略家，總能看到長遠的發展趨勢。" },
  ISTP: { title: "實幹家", trait: "觀察敏銳、動手能力強。您喜歡分析運作邏輯，冷靜地面對挑戰。" },
  ISFP: { title: "行動勝於言語", trait: "溫和、感性、自由。您活在當下，對美感有獨特的追求。" },
  INFP: { title: "善良的理想家", trait: "理想化、忠誠、有彈性。您內心世界豐富，致力於符合自我價值的目標。" },
  INTP: { title: "問題解決者", trait: "邏輯性強、好奇心重。您熱愛思考抽象理論，尋找邏輯上的解釋。" },
  ESTP: { title: "活在當下", trait: "活力充沛、實際、大膽。您是天生的冒險家，擅長解決即時的危機。" },
  ESFP: { title: "樂天派", trait: "外向、熱情、有趣。您喜歡成為焦點，能為周遭的人帶來快樂。" },
  ENFP: { title: "創造力豐富者", trait: "充滿熱情、富有想像力。您看重可能性，喜歡激發他人的潛能。" },
  ENTP: { title: "智多星", trait: "思辨力強、反傳統。您喜歡挑戰現狀，從智力交鋒中獲得樂趣。" },
  ESTJ: { title: "天生的執行者", trait: "組織者、明確、果斷。您擅長管理事務，確保事情按部就班。" },
  ESFJ: { title: "受歡迎的朋友", trait: "慷慨、溫溫暖、合作。您熱心助人，重視和諧的社交關係。" },
  ENFJ: { title: "言辭流利者", trait: "迷人、鼓舞人心。您是天生的導師，能凝聚人心走向目標。" },
  ENTJ: { title: "天生的領導者", trait: "統籌者、有遠見、意志堅定。您直率果敢，是強大的推動力。" }
};

export default function App() {
  const [step, setStep] = useState('welcome');
  const [gender, setGender] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setStep('survey');
  };

  const handleAnswer = (questionId, type, w) => {
    setAnswers({ ...answers, [questionId]: { type, w } });
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const results = useMemo(() => {
    if (step !== 'result') return null;
    const raw = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach(ans => { raw[ans.type] += ans.w; });

    // 計分修正：男性 T + 1
    const finalT = gender === 'male' ? raw.T + 1 : raw.T;
    const finalF = raw.F;

    const mbti = [
      raw.E > raw.I ? 'E' : 'I',
      raw.S > raw.N ? 'S' : 'N',
      finalT > finalF ? 'T' : 'F',
      raw.J > raw.P ? 'J' : 'P'
    ].join('');
    
    return { mbti, scores: { ...raw, T: finalT, F: finalF } };
  }, [step, answers, gender]);

  // UI Render Logic (與你提供的結構一致)
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <ClipboardCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">MBTI 專業性格測驗</h1>
            <p className="text-slate-500 mt-2 text-sm">G表格式 94 題完整版</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-8 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm border-b border-amber-200 pb-2">
              <Info size={16} /> 官方計分規則
            </div>
            <ul className="text-xs text-amber-700 space-y-2 leading-relaxed">
              <li>• 男士「T」總分將自動 <strong>加上 1 分</strong>。</li>
              <li>• 若得分相同，將自動判定為：<strong>I、N、F、P</strong>。</li>
            </ul>
          </div>
          <button onClick={() => setStep('gender')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            了解規則，開始測驗 <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'gender') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-center text-xl font-bold text-slate-800 mb-8">請選擇您的性別</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleGenderSelect('male')} className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all">
              <User className="text-slate-300 group-hover:text-blue-500 mb-2" size={48} />
              <span className="text-slate-600 group-hover:text-blue-700 font-bold">男性 (Male)</span>
            </button>
            <button onClick={() => handleGenderSelect('female')} className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50 transition-all">
              <UserCheck className="text-slate-300 group-hover:text-rose-500 mb-2" size={48} />
              <span className="text-slate-600 group-hover:text-rose-700 font-bold">女性 (Female)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'survey') {
    const q = QUESTIONS[currentIndex];
    const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400">題號 {q.id} / 94</span>
            <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-12 min-h-[420px] flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
              {q.id}. {q.text}
            </h2>
            <div className="space-y-4 mt-auto">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, opt.type, opt.w)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    answers[q.id]?.type === opt.type && answers[q.id]?.w === opt.w
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md' 
                      : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-lg font-bold">{opt.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[q.id]?.type === opt.type && answers[q.id]?.w === opt.w ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                    {answers[q.id]?.type === opt.type && <CheckCircle2 className="text-white" size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} className="px-6 py-2 text-slate-400 hover:text-slate-600 disabled:opacity-0 flex items-center gap-1 font-bold">
              <ChevronLeft size={20} /> 上一題
            </button>
            {currentIndex === QUESTIONS.length - 1 && answers[q.id] ? (
              <button onClick={() => setStep('result')} className="bg-indigo-600 text-white px-10 py-3 rounded-full font-bold shadow-xl">
                完成並計算結果
              </button>
            ) : (
              <button disabled={!answers[q.id]} onClick={() => setCurrentIndex(currentIndex + 1)} className="px-8 py-2 bg-white text-indigo-600 rounded-full font-bold shadow-md border border-indigo-100 disabled:opacity-30 flex items-center gap-1">
                下一題 <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const info = DESCRIPTIONS[results.mbti];
    const { scores } = results;
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-10 flex justify-center items-start">
        <div className="max-w-3xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 p-12 text-center text-white">
            <h1 className="text-9xl font-black mb-2 tracking-tighter">{results.mbti}</h1>
            <div className="text-2xl font-bold bg-white/20 inline-block px-8 py-2 rounded-2xl">{info?.title}</div>
          </div>
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-50 p-8 rounded-[2rem]">
                <h3 className="text-slate-800 font-black text-sm uppercase mb-4 flex items-center gap-2"><Info size={18} /> 特質描述</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{info?.trait}</p>
              </div>
              <div className="bg-indigo-50/50 p-8 rounded-[2rem]">
                <h3 className="text-indigo-800 font-black text-sm uppercase mb-4 flex items-center gap-2"><BarChart3 size={18} /> 得分統計</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {Object.entries(scores).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-black">{k}</div>
                      <div className="text-xl font-black text-slate-800">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-10 mb-12">
              <DimBar left="外向 E" right="內向 I" lVal={scores.E} rVal={scores.I} tie="I" color="bg-amber-500" />
              <DimBar left="實感 S" right="直覺 N" lVal={scores.S} rVal={scores.N} tie="N" color="bg-emerald-500" />
              <DimBar left="思考 T" right="情感 F" lVal={scores.T} rVal={scores.F} tie="F" color="bg-blue-500" />
              <DimBar left="判斷 J" right="知覺 P" lVal={scores.J} rVal={scores.P} tie="P" color="bg-purple-500" />
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2"><RefreshCw size={20} /> 重新測驗</button>
          </div>
        </div>
      </div>
    );
  }
}

function DimBar({ left, right, lVal, rVal, tie, color }) {
  const total = lVal + rVal || 1;
  const lPer = (lVal / total) * 100;
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold">
        <span>{left} ({lVal})</span>
        <span>{right} ({rVal})</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
        <div className={`h-full ${color}`} style={{ width: `${lPer}%` }}></div>
        {lVal === rVal && <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">同分判定: {tie}</div>}
      </div>
    </div>
  );
}