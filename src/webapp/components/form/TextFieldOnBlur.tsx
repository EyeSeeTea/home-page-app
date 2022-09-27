import { TextField, TextFieldProps } from "@material-ui/core";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* Wrap TextField with those two changes:

- props.onChange is called on blur, not on every keystroke, this way the UI is much more responsive.
*/

type TextFieldOnBlurProps = TextFieldProps & {
    value: string;
};

const TextFieldOnBlur: React.FC<TextFieldOnBlurProps> = props => {
    const { onChange } = props;
    // Use props.value as initial value for the initial state but also react to changes from the parent
    const propValue = props.value;
    const prevPropValue = useRef(propValue);
    const [value, setValue] = useState<string>(propValue);

    useEffect(() => {
        if (propValue !== prevPropValue.current) {
            setValue(propValue);
            prevPropValue.current = propValue;
        }
    }, [propValue, prevPropValue, value]);

    const callParentOnChange = useCallback<NonNullable<TextFieldProps["onBlur"]>>(
        ev => {
            if (onChange) onChange(ev);
        },
        [onChange]
    );

    const setValueFromEvent = useCallback(
        (ev: React.ChangeEvent<{ value: string }>) => {
            setValue(ev.target.value);
        },
        [setValue]
    );

    return <TextField {...props} value={value} onBlur={callParentOnChange} onChange={setValueFromEvent} />;
};

export default React.memo(TextFieldOnBlur);
