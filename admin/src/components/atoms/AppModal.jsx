import { Modal } from 'antd';

const MAX_BODY_HEIGHT = '70vh';

// capped body height so long content (detail views, forms with many fields)
// scrolls inside the modal instead of the modal itself growing past the
// viewport. Callers can still override anything via props/styles.
export default function AppModal({ styles, ...props }) {
    return (
        <Modal
            centered
            styles={{
                ...styles,
                body: {
                    maxHeight: MAX_BODY_HEIGHT,
                    overflowY: 'auto',
                    paddingRight: 8,
                    ...styles?.body,
                },
            }}
            {...props}
        />
    );
}
