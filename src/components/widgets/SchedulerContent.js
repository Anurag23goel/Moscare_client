import React from 'react';
import styles from '@/styles/scheduler2.module.css';

const SchedulerContent = ({renderHeader, renderRows}) => {
    return (
        <div className="bg-white">
            <div className={styles.schedulerContent}>
                <div className={styles.schedulerColumn}>
                    {renderHeader()}
                    {renderRows()}
                </div>
            </div>
        </div>
    );
};

export default SchedulerContent;
