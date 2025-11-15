import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Question, Plano } from '../../types';
import { DomainTag } from '../common/DomainTag';
import { Button, GhostButton } from '../ui/Button';
import { Checkbox } from '../ui/Input';
import { cn, linkAWS } from '../../utils';
import { R } from '../../constants';

interface QuestionViewerProps {
    questao: Question;
    indice: number;
    total: number;
    onEnviar: (answer: string[]) => void;
    onProxima: () => void;
    level: 'basic' | 'detailed';
    onPrev?: () => void;
    initialAnswer: string[];
    plano: Plano;
    isMarked: boolean;
    onMark: (marked: boolean) => void;
    navAfterBack?: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
    questao,
    indice,
    total,
    onEnviar,
    onProxima,
    level,
    onPrev,
    initialAnswer,
    plano: _plano,
    isMarked,
    onMark,
    navAfterBack = false,
}) => {
    const { t } = useTranslation(['quiz', 'common']);
    const isMultiSelect = questao.requiredSelections > 1 || questao.answerKey.length > 1;

    const [escolha, setEscolha] = useState<string[]>(initialAnswer ?? []);
    const [enviado, setEnviado] = useState<boolean>(
        (initialAnswer ?? []).length >= questao.requiredSelections && (initialAnswer ?? []).length > 0
    );

    const initialAnswerKey = useMemo(
        () => (initialAnswer ?? []).slice().sort().join('|'),
        [initialAnswer]
    );

    useEffect(() => {
        const normalizedInitial = (initialAnswer ?? []).slice();
        setEscolha(normalizedInitial);
        setEnviado(
            normalizedInitial.length >= questao.requiredSelections && normalizedInitial.length > 0
        );
    }, [indice, initialAnswerKey, questao.requiredSelections]);

    const handleOptionToggle = (optionKey: string) => {
        if (enviado) return;

        setEscolha((prev) => {
            if (prev.includes(optionKey)) {
                return prev.filter((opt) => opt !== optionKey);
            }

            if (isMultiSelect) {
                if (prev.length >= questao.requiredSelections) {
                    return prev;
                }
                return [...prev, optionKey];
            }

            return [optionKey];
        });
    };

    const selectionReady = escolha.length === questao.requiredSelections;

    const submit = () => {
        if (!selectionReady) return;
        setEnviado(true);
        console.log('[Quiz] Responder', { indice: indice + 1, escolha });
        onEnviar(escolha);
    };

    const handleMarkChange = (marked: boolean) => {
        console.log('[Quiz] Marcar para revisão', { indice: indice + 1, marcado: marked });
        onMark(marked);
    };

    const isLastQuestion = indice + 1 >= total;

    const formatAnswers = (answers: string[]) =>
        answers
            .slice()
            .sort()
            .map((letter) => `${letter}`)
            .join(', ');

    return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4" style={{ borderRadius: 12 }}>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('quiz:question_viewer.total_questions', { total })}</div>
            </div>
            <div className="mb-2">
                <DomainTag domain={questao.domain} />
            </div>
            <div className="flex items-start gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex-shrink-0">
                    {indice + 1}
                </span>
                <div className="font-medium text-gray-900 dark:text-gray-100 flex-grow">{questao.stem}</div>
            </div>
            <div className="space-y-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isMultiSelect
                        ? t('quiz:question_viewer.select_alternatives', { count: questao.requiredSelections })
                        : t('quiz:question_viewer.select_one')}
                </div>
                {Object.entries(questao.options).map(([key, value]) => {
                    if (!value) return null;

                    const isSelected = escolha.includes(key);
                    const isCorrectOption = questao.answerKey.includes(key);
                    const showCorrectSelected = enviado && isCorrectOption && isSelected;
                    const showCorrectMissed = enviado && isCorrectOption && !isSelected;
                    const showIncorrect = enviado && isSelected && !isCorrectOption;

                    return (
                        <label
                            key={key}
                            className={cn(
                                'flex items-center gap-3 border p-3 cursor-pointer dark:border-gray-700 text-gray-800 dark:text-gray-300 transition-all duration-200 ease-in-out rounded-lg',
                                R.md,
                                !enviado &&
                                    isSelected &&
                                    'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-gray-700/50 scale-[1.02]',
                                showCorrectSelected &&
                                    'bg-green-50 dark:bg-green-900/40 border-green-400 dark:border-green-500',
                                showCorrectMissed &&
                                    'border-green-300 dark:border-green-600 bg-green-50/40 dark:bg-green-900/20',
                                showIncorrect &&
                                    'bg-red-50 dark:bg-red-900/50 border-red-300 dark:border-red-700',
                                enviado && !isSelected && !isCorrectOption && 'opacity-80 cursor-default'
                            )}
                        >
                            <input
                                type={isMultiSelect ? 'checkbox' : 'radio'}
                                name={`q-${indice}`}
                                className="text-purple-600 focus:ring-purple-500"
                                checked={isSelected}
                                onChange={() => handleOptionToggle(key)}
                                disabled={enviado}
                            />
                            <div>
                                <span className="font-semibold mr-2">{key}.</span>
                                {value}
                            </div>
                        </label>
                    );
                })}
                {isMultiSelect && !enviado && questao.requiredSelections > 1 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {selectionReady
                            ? t('quiz:question_viewer.selection_complete')
                            : t('quiz:question_viewer.remaining_alternatives', { count: questao.requiredSelections - escolha.length })}
                    </div>
                )}
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {onPrev && <GhostButton onClick={onPrev}>{t('common:buttons.back')}</GhostButton>}
                    <Checkbox label={t('quiz:question_viewer.mark_review')} checked={isMarked} onChange={handleMarkChange} />
                </div>
                <div>
                    {!enviado ? (
                        isMarked ? (
                            <Button
                                onClick={() => {
                                    console.log('[Quiz] Pular (marcada) para próxima', { de: indice + 1 });
                                    onProxima();
                                }}
                            >
                                {t('common:buttons.next')}
                            </Button>
                        ) : (
                            <Button onClick={submit} disabled={!selectionReady}>
                                {t('common:buttons.answer')}
                            </Button>
                        )
                    ) : (
                        <Button onClick={onProxima} disabled={navAfterBack && isLastQuestion}>
                            {navAfterBack && isLastQuestion ? t('quiz:header.finish') : t('common:buttons.next')}
                        </Button>
                    )}
                </div>
            </div>
            {enviado && (
                <>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                        <div>
                            <span className="font-semibold">{t('quiz:question_viewer.your_answer')}</span>{' '}
                            {escolha.length ? formatAnswers(escolha) : t('quiz:question_viewer.no_alternative_selected')}
                        </div>
                        <div>
                            <span className="font-semibold">{t('quiz:question_viewer.correct_answer')}</span>{' '}
                            {formatAnswers(questao.answerKey)}
                        </div>
                        {isMultiSelect && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('quiz:question_viewer.requires_correct_alternatives', { count: questao.requiredSelections })}
                            </div>
                        )}
                    </div>
                    {level === 'basic' ? (
                        <div
                            className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 text-sm text-gray-800 dark:text-gray-300"
                            style={{ borderRadius: 10 }}
                        >
                            <div className="font-semibold mb-1">{t('quiz:question_viewer.explanation')}</div>
                            <div>{questao.explanation_basic}</div>
                        </div>
                    ) : (
                        <div>
                            <div
                                className="mt-4 p-3 border-2 border-green-600 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200 text-sm"
                                style={{ borderRadius: 10 }}
                            >
                                <div className="font-semibold mb-1">{t('quiz:question_viewer.explanation_correct')}</div>
                                <div dangerouslySetInnerHTML={{ __html: linkAWS(questao.explanation_detailed) }} />
                            </div>
                            {questao.incorrect && (
                                <div
                                    className="mt-3 p-3 border-2 border-red-300 bg-white dark:bg-gray-800 dark:border-red-700/50 text-sm text-gray-800 dark:text-gray-300"
                                    style={{ borderRadius: 10 }}
                                >
                                    <div className="font-semibold text-red-700 dark:text-red-400 mb-1">
                                        {t('quiz:question_viewer.why_incorrect')}
                                    </div>
                                    <ul className="list-disc pl-5">
                                        {Object.entries(questao.incorrect)
                                            .filter(([key]) => !questao.answerKey.includes(key))
                                            .map(([key, txt]) => (
                                                <li key={key}>
                                                    <b>{key}.</b> {txt}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
