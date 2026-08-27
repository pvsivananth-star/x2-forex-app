import React, {useEffect, useRef, useState} from 'react';
import {TextInput} from 'react-native';

export function RateInput({
                              value,
                              active,
                              onChange,
                              onActivate,
                              onDeactivate,
                          }: {
    value: number;
    active?: boolean;
    onChange?: (value: number) => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
}) {
    const inputRef =
        useRef<TextInput>(null);

    const [text, setText] =
        useState(String(value));

    const editingRef =
        useRef(false);

    /*
     * Keep the displayed text synchronized
     * when the value changes externally.
     *
     * Do NOT overwrite the text while the
     * user is typing.
     */
    useEffect(() => {
        if (!editingRef.current) {
            setText(String(value));
        }
    }, [value]);

    const commit = () => {
        editingRef.current = false;

        const trimmed =
            text.trim();

        const n =
            Number(trimmed);

        if (
            trimmed.length > 0 &&
            Number.isFinite(n) &&
            n > 0
        ) {
            onChange?.(n);
        } else {
            setText(String(value));
        }
    };

    return (
        <TextInput
            ref={inputRef}
            value={text}
            keyboardType="decimal-pad"
            selectTextOnFocus
            returnKeyType="done"

            onFocus={() => {
                editingRef.current = true;
                onActivate?.();
            }}

            onChangeText={nextText => {
                /*
                 * ONLY update this field while typing.
                 *
                 * Do not call onChange here.
                 */
                setText(nextText);
            }}

            onBlur={() => {
                // Do not auto-commit on blur; stop editing so external updates can sync the display.
                editingRef.current = false;
                onDeactivate?.();
            }}

            onSubmitEditing={() => {
                // Commit only on explicit submit (Enter/Done)
                commit();
                inputRef.current?.blur();
            }}

            style={{
                minWidth: 84,
                textAlign: 'right',

                // Visual indicator for the active (editing) field — rely on parent-controlled `active`
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? '#222' : undefined,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 6,
            }}
        />
    );
}