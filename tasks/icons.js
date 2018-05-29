import gulp from 'gulp';
import path from 'path';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import { reload } from 'browser-sync';
import config from './config';

const typeConfig = config.icons;

const base = path.join(config.root.src, typeConfig.src);

const icons = () =>
	gulp.
		src(path.join(base, typeConfig.extensions), { base: base }).
		pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })).
		pipe(gulp.dest(path.join(config.root.dist, typeConfig.dist))).
		pipe(reload({ stream: true }));

gulp.task('icons', icons);

export default icons;
